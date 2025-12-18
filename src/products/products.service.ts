import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Product } from "../entities/product.entity";
import { Category } from "../entities/category.entity";
import { Brand } from "../entities/brand.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { DeleteProductDto } from "./dto/delete-product.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { ResponseHelper } from "../common/helpers/response.helper";
import {
  ApiResponse,
  PaginatedApiResponse,
} from "../common/interfaces/api-response.interface";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>
  ) {}

  private readonly filesBackendBaseUrl =
    process.env.FILES_BACKEND_URL || "http://localhost:3003";

  private extractProductsFileNameFromUrl(url: string): string | null {
    try {
      const u = new URL(url);
      const prefix = "/public/products/";
      if (!u.pathname.startsWith(prefix)) {
        return null;
      }
      const fileName = u.pathname.slice(prefix.length);
      if (!fileName) {
        return null;
      }
      return fileName;
    } catch {
      return null;
    }
  }

  private async deleteProductImageFromFilesBackend(
    fileName: string,
    authorizationHeader?: string
  ): Promise<void> {
    const endpoint = `${this.filesBackendBaseUrl}/v1/products/image/${encodeURIComponent(
      fileName
    )}`;

    const fetchFn: any = (global as any).fetch;
    const AbortControllerCtor: any = (global as any).AbortController;

    if (!fetchFn) {
      return;
    }

    const headers: Record<string, string> = {};
    if (authorizationHeader) {
      headers["authorization"] = authorizationHeader;
    }

    const controller = AbortControllerCtor ? new AbortControllerCtor() : undefined;
    const timeoutMs = parseInt(process.env.FILES_BACKEND_TIMEOUT_MS || "15000", 10);
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

    try {
      await fetchFn(endpoint, {
        method: "DELETE",
        headers,
        signal: controller?.signal,
      });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private getImageMimeTypeFromPath(path: string): string {
    const lower = (path || "").toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".gif")) return "image/gif";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".bmp")) return "image/bmp";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    return "application/octet-stream";
  }

  private getImageFileExtFromMimeType(mimeType: string): string {
    const mt = (mimeType || "").toLowerCase();
    if (mt.includes("png")) return "png";
    if (mt.includes("gif")) return "gif";
    if (mt.includes("webp")) return "webp";
    if (mt.includes("bmp")) return "bmp";
    if (mt.includes("jpeg") || mt.includes("jpg")) return "jpg";
    return "bin";
  }

  private collectNodesByKey(obj: any, key: string, out: any[] = []): any[] {
    if (!obj || typeof obj !== "object") return out;
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const v = (obj as any)[key];
      if (Array.isArray(v)) out.push(...v);
      else out.push(v);
    }
    for (const k of Object.keys(obj)) {
      const v = (obj as any)[k];
      if (v && typeof v === "object") {
        this.collectNodesByKey(v, key, out);
      }
    }
    return out;
  }

  private async extractFirstMediaImageFromXlsx(
    fileBuffer: Buffer
  ): Promise<{ buffer: Buffer; mimetype: string; originalname: string } | null> {
    try {
      const zip = await JSZip.loadAsync(fileBuffer as any);
      const mediaFiles = Object.keys((zip as any).files || {})
        .filter((p) => /^xl\/media\//i.test(p))
        .filter((p) => /\.(png|jpe?g|gif|webp|bmp)$/i.test(p));

      if (mediaFiles.length < 1) {
        return null;
      }

      const mediaPath = mediaFiles.sort()[0];
      const f = zip.file(mediaPath);
      if (!f) return null;

      const buffer = (await f.async("nodebuffer")) as Buffer;
      const mimetype = this.getImageMimeTypeFromPath(mediaPath);
      const ext = this.getImageFileExtFromMimeType(mimetype);
      return {
        buffer,
        mimetype,
        originalname: `excel-image.${ext}`,
      };
    } catch {
      return null;
    }
  }

  private async extractImagesFromVml(
    zip: JSZip,
    parser: XMLParser,
    vmlPath: string,
    vmlRelsPath: string,
    imageColumnIndexZeroBased: number
  ): Promise<Map<number, { buffer: Buffer; mimetype: string; originalname: string }>> {
    const vmlFile = zip.file(vmlPath);
    const vmlRelsFile = zip.file(vmlRelsPath);
    if (!vmlFile || !vmlRelsFile) {
      return new Map();
    }

    const vmlXml = await vmlFile.async("text");
    const vmlRelsXml = await vmlRelsFile.async("text");
    const vmlDoc: any = parser.parse(vmlXml);
    const vmlRelsDoc: any = parser.parse(vmlRelsXml);

    const dRels = vmlRelsDoc?.Relationships?.Relationship;
    const dRelArr = Array.isArray(dRels) ? dRels : dRels ? [dRels] : [];
    const embedIdToTarget = new Map<string, string>();
    for (const r of dRelArr) {
      const id = r?.["@_Id"];
      const target = r?.["@_Target"];
      if (id && target) {
        embedIdToTarget.set(String(id), String(target));
      }
    }

    const shapes = this.collectNodesByKey(vmlDoc, "shape");
    const out = new Map<number, { buffer: Buffer; mimetype: string; originalname: string }>();

    for (const s of shapes) {
      const clientDataRaw = s?.ClientData || s?.clientData || s?.clientdata;
      const clientData = Array.isArray(clientDataRaw) ? clientDataRaw[0] : clientDataRaw;

      const rowRaw = clientData?.Row ?? clientData?.row;
      const colRaw = clientData?.Column ?? clientData?.column;
      const rowVal = Array.isArray(rowRaw) ? rowRaw[0] : rowRaw;
      const colVal = Array.isArray(colRaw) ? colRaw[0] : colRaw;

      const row =
        rowVal !== undefined
          ? parseInt(String(rowVal?.["#text"] ?? rowVal).trim(), 10)
          : NaN;
      const col =
        colVal !== undefined
          ? parseInt(String(colVal?.["#text"] ?? colVal).trim(), 10)
          : NaN;
      if (!Number.isFinite(row) || !Number.isFinite(col)) continue;
      if (col !== imageColumnIndexZeroBased) continue;

      const imagedata = s?.imagedata || s?.imageData || s?.ImageData;
      const embedId =
        imagedata?.["@_r:id"] ||
        imagedata?.["@_id"] ||
        imagedata?.["@_o:relid"] ||
        imagedata?.["@_relid"];
      if (!embedId) continue;

      const target = embedIdToTarget.get(String(embedId));
      if (!target) continue;

      const mediaPath = `xl/${String(target).replace(/^\.\.\//, "")}`;
      const mediaFile = zip.file(mediaPath);
      if (!mediaFile) continue;

      const buffer = (await mediaFile.async("nodebuffer")) as Buffer;
      const mimetype = this.getImageMimeTypeFromPath(mediaPath);
      const excelRowNumber = row + 1;
      if (!out.has(excelRowNumber)) {
        const ext = this.getImageFileExtFromMimeType(mimetype);
        out.set(excelRowNumber, {
          buffer,
          mimetype,
          originalname: `excel-image-row-${excelRowNumber}.${ext}`,
        });
      }
    }

    return out;
  }

  private async extractEmbeddedImagesByRowFromXlsx(
    fileBuffer: Buffer,
    imageColumnIndexZeroBased: number
  ): Promise<Map<number, { buffer: Buffer; mimetype: string; originalname: string }>> {
    const zip = await JSZip.loadAsync(fileBuffer as any);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      removeNSPrefix: true,
    });

    const readText = (v: any): string => {
      if (v === null || v === undefined) return "";
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        return String(v);
      }
      if (typeof v === "object") {
        if (typeof (v as any)["#text"] === "string" || typeof (v as any)["#text"] === "number") {
          return String((v as any)["#text"]);
        }
      }
      return "";
    };

    const readInt = (v: any): number => {
      const s = readText(v).trim();
      const n = parseInt(s, 10);
      return Number.isFinite(n) ? n : NaN;
    };

    const workbookXmlFile = zip.file("xl/workbook.xml");
    const workbookRelsFile = zip.file("xl/_rels/workbook.xml.rels");
    if (!workbookXmlFile || !workbookRelsFile) {
      return new Map();
    }

    const workbookXml = await workbookXmlFile.async("text");
    const workbookRelsXml = await workbookRelsFile.async("text");
    const workbookDoc: any = parser.parse(workbookXml);
    const workbookRelsDoc: any = parser.parse(workbookRelsXml);

    const sheetsRaw = workbookDoc?.workbook?.sheets?.sheet;
    const sheetsArr = Array.isArray(sheetsRaw) ? sheetsRaw : sheetsRaw ? [sheetsRaw] : [];
    const firstSheet = sheetsArr[0];
    const firstSheetRelId = firstSheet?.["@_r:id"] || firstSheet?.["@_id"];
    if (!firstSheetRelId) {
      return new Map();
    }

    const wbRelsRaw = workbookRelsDoc?.Relationships?.Relationship;
    const wbRelsArr = Array.isArray(wbRelsRaw) ? wbRelsRaw : wbRelsRaw ? [wbRelsRaw] : [];
    const sheetRel = wbRelsArr.find((r: any) => r?.["@_Id"] === firstSheetRelId);
    const sheetTarget = sheetRel?.["@_Target"];
    if (!sheetTarget) {
      return new Map();
    }

    const sheetXmlPath = `xl/${String(sheetTarget).replace(/^\.\.\//, "")}`;
    const sheetFileName = sheetXmlPath.split("/").pop();
    if (!sheetFileName) {
      return new Map();
    }
    const sheetRelsPath = `xl/worksheets/_rels/${sheetFileName}.rels`;

    const sheetXmlFile = zip.file(sheetXmlPath);
    const sheetRelsFile = zip.file(sheetRelsPath);
    if (!sheetXmlFile || !sheetRelsFile) {
      return new Map();
    }

    const sheetXml = await sheetXmlFile.async("text");
    const sheetRelsXml = await sheetRelsFile.async("text");

    const sheetDoc: any = parser.parse(sheetXml);
    const relsDoc: any = parser.parse(sheetRelsXml);

    const drawingRelId =
      sheetDoc?.worksheet?.drawing?.["@_r:id"] ||
      sheetDoc?.worksheet?.drawing?.["@_id"];

    const legacyDrawingRelId =
      sheetDoc?.worksheet?.legacyDrawing?.["@_r:id"] ||
      sheetDoc?.worksheet?.legacyDrawing?.["@_id"];

    if (!drawingRelId && !legacyDrawingRelId) {
      return new Map();
    }

    const relationships = relsDoc?.Relationships?.Relationship;
    const relArr = Array.isArray(relationships) ? relationships : relationships ? [relationships] : [];
    const drawingRel = drawingRelId
      ? relArr.find((r: any) => r?.["@_Id"] === drawingRelId)
      : undefined;
    const legacyRel = legacyDrawingRelId
      ? relArr.find((r: any) => r?.["@_Id"] === legacyDrawingRelId)
      : undefined;

    const drawingTarget = drawingRel?.["@_Target"];
    const legacyTarget = legacyRel?.["@_Target"];

    if (!drawingTarget && legacyTarget) {
      const vmlPath = `xl/${String(legacyTarget).replace(/^\.\.\//, "")}`;
      const vmlRelsPath = vmlPath.replace(
        "xl/drawings/",
        "xl/drawings/_rels/"
      ) + ".rels";

      return this.extractImagesFromVml(
        zip,
        parser,
        vmlPath,
        vmlRelsPath,
        imageColumnIndexZeroBased
      );
    }

    if (!drawingTarget) {
      return new Map();
    }

    const drawingPath = `xl/${String(drawingTarget).replace(/^\.\.\//, "")}`;
    const drawingRelsPath = drawingPath.replace(
      "xl/drawings/",
      "xl/drawings/_rels/"
    ) + ".rels";

    const drawingFile = zip.file(drawingPath);
    const drawingRelsFile = zip.file(drawingRelsPath);
    if (!drawingFile || !drawingRelsFile) {
      return new Map();
    }

    const drawingXml = await drawingFile.async("text");
    const drawingRelsXml = await drawingRelsFile.async("text");
    const drawingDoc: any = parser.parse(drawingXml);
    const drawingRelsDoc: any = parser.parse(drawingRelsXml);

    const dRels = drawingRelsDoc?.Relationships?.Relationship;
    const dRelArr = Array.isArray(dRels) ? dRels : dRels ? [dRels] : [];
    const embedIdToTarget = new Map<string, string>();
    for (const r of dRelArr) {
      const id = r?.["@_Id"];
      const target = r?.["@_Target"];
      if (id && target) {
        embedIdToTarget.set(String(id), String(target));
      }
    }

    const anchorsTwoRaw =
      drawingDoc?.wsDr?.twoCellAnchor || drawingDoc?.xdrWsDr?.twoCellAnchor;
    const anchorsOneRaw =
      drawingDoc?.wsDr?.oneCellAnchor || drawingDoc?.xdrWsDr?.oneCellAnchor;
    const anchorsTwo =
      Array.isArray(anchorsTwoRaw) ? anchorsTwoRaw : anchorsTwoRaw ? [anchorsTwoRaw] : [];
    const anchorsOne =
      Array.isArray(anchorsOneRaw) ? anchorsOneRaw : anchorsOneRaw ? [anchorsOneRaw] : [];
    const anchors = [...anchorsTwo, ...anchorsOne];

    const out = new Map<number, { buffer: Buffer; mimetype: string; originalname: string }>();
    for (const a of anchors) {
      const from = a?.from;
      const fromCol = readInt(from?.col);
      const fromRow = readInt(from?.row);
      if (!Number.isFinite(fromCol) || !Number.isFinite(fromRow)) continue;
      if (fromCol !== imageColumnIndexZeroBased) continue;

      const embedId =
        a?.pic?.blipFill?.blip?.["@_r:embed"] ||
        a?.pic?.blipFill?.blip?.["@_embed"];
      if (!embedId) continue;

      const target = embedIdToTarget.get(String(embedId));
      if (!target) continue;

      const mediaPath = `xl/${String(target).replace(/^\.\.\//, "")}`;
      const mediaFile = zip.file(mediaPath);
      if (!mediaFile) continue;

      const buffer = (await mediaFile.async("nodebuffer")) as Buffer;
      const mimetype = this.getImageMimeTypeFromPath(mediaPath);
      const excelRowNumber = fromRow + 1;

      if (!out.has(excelRowNumber)) {
        const ext = this.getImageFileExtFromMimeType(mimetype);
        out.set(excelRowNumber, {
          buffer,
          mimetype,
          originalname: `excel-image-row-${excelRowNumber}.${ext}`,
        });
      }
    }

    return out;
  }

  private async uploadProductImageToFilesBackend(
    productId: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
    authorizationHeader?: string
  ): Promise<string> {
    const endpoint = `${this.filesBackendBaseUrl}/v1/products/${productId}/image`;

    const fetchFn: any = (global as any).fetch;
    const FormDataCtor: any = (global as any).FormData;
    const BlobCtor: any = (global as any).Blob;
    const AbortControllerCtor: any = (global as any).AbortController;

    if (!fetchFn || !FormDataCtor || !BlobCtor) {
      throw new BadRequestException(
        "Files upload requires Node.js runtime with fetch/FormData/Blob support"
      );
    }

    const form = new FormDataCtor();
    const blob = new BlobCtor([file.buffer], { type: file.mimetype });
    form.append("file", blob, file.originalname);

    const headers: Record<string, string> = {};
    if (authorizationHeader) {
      headers["authorization"] = authorizationHeader;
    }

    const controller = AbortControllerCtor ? new AbortControllerCtor() : undefined;
    const timeoutMs = parseInt(process.env.FILES_BACKEND_TIMEOUT_MS || "15000", 10);
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

    try {
      const res = await fetchFn(endpoint, {
        method: "POST",
        body: form,
        headers,
        signal: controller?.signal,
      });

      const text = await res.text();
      let json: any;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }

      if (!res.ok) {
        throw new BadRequestException(
          json?.message || `Files backend upload failed (${res.status})`
        );
      }

      const url =
        json?.url ||
        json?.data?.url ||
        json?.data?.fileUrl ||
        json?.data?.file_url;

      if (!url || typeof url !== "string") {
        throw new BadRequestException(
          "Files backend did not return a valid image URL"
        );
      }

      return url;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private sanitizeSkuSegment(value: string): string {
    return (value || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  private async generateSku(brandName: string, categoryName: string) {
    const brandSegment = this.sanitizeSkuSegment(brandName);
    const categorySegment = this.sanitizeSkuSegment(categoryName);

    if (!brandSegment || !categorySegment) {
      throw new BadRequestException("Invalid brand/category for SKU generation");
    }

    const prefix = `${brandSegment}-${categorySegment}`;

    const lastProduct = await this.productRepository
      .createQueryBuilder("p")
      .select(["p.sku"])
      .where("p.sku LIKE :pattern", { pattern: `${prefix}-%` })
      .orderBy("p.sku", "DESC")
      .limit(1)
      .getOne();

    let nextSeq = 1;

    if (lastProduct?.sku) {
      const match = lastProduct.sku.match(/-(\d{4})$/);
      if (match?.[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }

    const seqSegment = String(nextSeq).padStart(4, "0");
    return `${prefix}-${seqSegment}`;
  }

  private normalizeName(value: string): string {
    return (value || "").trim();
  }

  private normalizeNameKey(value: string): string {
    return this.normalizeName(value).toLowerCase();
  }

  private chunkArray<T>(items: T[], chunkSize: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      out.push(items.slice(i, i + chunkSize));
    }
    return out;
  }

  private parseSkuSequence(sku: string | undefined): number {
    if (!sku) return 0;
    const match = sku.match(/-(\d{4})$/);
    if (!match?.[1]) return 0;
    const n = parseInt(match[1], 10);
    return Number.isFinite(n) ? n : 0;
  }

  private async ensureCategoryByName(name: string): Promise<Category> {
    const trimmed = this.normalizeName(name);
    const existing = await this.categoryRepository
      .createQueryBuilder("c")
      .where("LOWER(c.name) = LOWER(:name)", { name: trimmed })
      .getOne();
    if (existing) return existing;

    try {
      return await this.categoryRepository.save({
        name: trimmed,
        description: null as any,
      } as any);
    } catch {
      const again = await this.categoryRepository
        .createQueryBuilder("c")
        .where("LOWER(c.name) = LOWER(:name)", { name: trimmed })
        .getOne();
      if (again) return again;
      throw new BadRequestException(`Failed to create category: ${trimmed}`);
    }
  }

  private async ensureBrandByName(name: string): Promise<Brand> {
    const trimmed = this.normalizeName(name);
    const existing = await this.brandRepository
      .createQueryBuilder("b")
      .where("LOWER(b.name) = LOWER(:name)", { name: trimmed })
      .getOne();
    if (existing) return existing;

    try {
      return await this.brandRepository.save({
        name: trimmed,
        description: null as any,
      } as any);
    } catch {
      const again = await this.brandRepository
        .createQueryBuilder("b")
        .where("LOWER(b.name) = LOWER(:name)", { name: trimmed })
        .getOne();
      if (again) return again;
      throw new BadRequestException(`Failed to create brand: ${trimmed}`);
    }
  }

  async bulkUploadFromExcel(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    authorizationHeader?: string
  ): Promise<ApiResponse<any>> {
    const expectedHeaders = [
      "title",
      "description",
      "price",
      "stock_quantity",
      "categorytitle",
      "brandtitle",
      "currency",
      "image",
    ];

    let rows: any[][];
    try {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames?.[0];
      if (!sheetName) {
        throw new BadRequestException("Excel file has no sheets");
      }
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
    } catch (e: any) {
      throw new BadRequestException(e?.message || "Invalid Excel file");
    }

    if (!rows || rows.length < 2) {
      return ResponseHelper.success(
        {
          totalRows: 0,
          processedRows: 0,
          createdCount: 0,
          failedCount: 0,
          failures: [],
        },
        "Bulk upload processed",
        "Product",
        200
      );
    }

    const headerRow = (rows[0] || []).map((h) => String(h || "").trim());
    const headerLower = headerRow.map((h) => h.toLowerCase());
    const expectedLower = expectedHeaders.map((h) => h.toLowerCase());

    const matches =
      headerLower.length >= expectedLower.length &&
      expectedLower.every((h, idx) => headerLower[idx] === h);

    if (!matches) {
      throw new BadRequestException(
        `Invalid Excel headers. Expected: ${expectedHeaders.join(", ")}`
      );
    }

    let embeddedImagesByRow = new Map<
      number,
      { buffer: Buffer; mimetype: string; originalname: string }
    >();
    try {
      embeddedImagesByRow = await this.extractEmbeddedImagesByRowFromXlsx(file.buffer, 7);
    } catch {
      embeddedImagesByRow = new Map();
    }

    type RowInput = {
      rowNumber: number;
      title: string;
      description?: string;
      price: number;
      stock_quantity: number;
      categorytitle: string;
      brandtitle: string;
      currency: string;
      product_img_url?: string;
      embeddedImage?: { buffer: Buffer; mimetype: string; originalname: string };
    };

    const failures: Array<{ rowNumber: number; reason: string; rowData?: any }> = [];
    const validRows: RowInput[] = [];

    let nonEmptyRows = 0;

    const fallbackMediaImage = await this.extractFirstMediaImageFromXlsx(file.buffer);

    for (let i = 1; i < rows.length; i++) {
      const excelRowNumber = i + 1;
      const r = rows[i] || [];

      const isEmptyRow = [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]].every(
        (c) => String(c ?? "").trim() === ""
      );
      if (isEmptyRow) {
        continue;
      }
      nonEmptyRows += 1;

      const imageCellRaw = r[7];
      const imageCellStr = String(imageCellRaw ?? "").trim();
      const normalizedImageCell = /^\[object\s+object\]$/i.test(imageCellStr)
        ? ""
        : imageCellStr;

      const obj: any = {
        title: String(r[0] || "").trim(),
        description: String(r[1] || "").trim(),
        price: r[2],
        stock_quantity: r[3],
        categorytitle: String(r[4] || "").trim(),
        brandtitle: String(r[5] || "").trim(),
        currency: String(r[6] || "").trim(),
        image: normalizedImageCell,
      };

      if (!obj.title) {
        failures.push({ rowNumber: excelRowNumber, reason: "Title is required" });
        continue;
      }
      if (!obj.categorytitle) {
        failures.push({
          rowNumber: excelRowNumber,
          reason: "Category title is required",
        });
        continue;
      }
      if (!obj.brandtitle) {
        failures.push({
          rowNumber: excelRowNumber,
          reason: "Brand title is required",
        });
        continue;
      }
      if (!obj.currency) {
        failures.push({
          rowNumber: excelRowNumber,
          reason: "Currency is required",
        });
        continue;
      }

      const priceNum = parseFloat(String(obj.price).trim());
      if (!Number.isFinite(priceNum)) {
        failures.push({ rowNumber: excelRowNumber, reason: "Invalid price" });
        continue;
      }

      const stockNum = parseInt(String(obj.stock_quantity).trim(), 10);
      if (!Number.isFinite(stockNum)) {
        failures.push({
          rowNumber: excelRowNumber,
          reason: "Invalid stock_quantity",
        });
        continue;
      }

      validRows.push({
        rowNumber: excelRowNumber,
        title: obj.title,
        description: obj.description || undefined,
        price: priceNum,
        stock_quantity: stockNum,
        categorytitle: obj.categorytitle,
        brandtitle: obj.brandtitle,
        currency: obj.currency,
        product_img_url: obj.image || undefined,
        embeddedImage: !obj.image
          ? embeddedImagesByRow.get(excelRowNumber) || fallbackMediaImage || undefined
          : undefined,
      });
    }

    const uniqueCategoryKeys = Array.from(
      new Set(validRows.map((r) => this.normalizeNameKey(r.categorytitle)).filter(Boolean))
    );
    const uniqueBrandKeys = Array.from(
      new Set(validRows.map((r) => this.normalizeNameKey(r.brandtitle)).filter(Boolean))
    );

    const categoryMap = new Map<string, Category>();
    const brandMap = new Map<string, Brand>();

    for (const key of uniqueCategoryKeys) {
      const original = validRows.find(
        (r) => this.normalizeNameKey(r.categorytitle) === key
      )?.categorytitle;
      if (!original) continue;
      const c = await this.ensureCategoryByName(original);
      categoryMap.set(key, c);
    }

    for (const key of uniqueBrandKeys) {
      const original = validRows.find(
        (r) => this.normalizeNameKey(r.brandtitle) === key
      )?.brandtitle;
      if (!original) continue;
      const b = await this.ensureBrandByName(original);
      brandMap.set(key, b);
    }

    type PreparedRow = {
      rowNumber: number;
      title: string;
      description?: string;
      price: number;
      stock_quantity: number;
      category: Category;
      brand: Brand;
      currency: string;
      skuPrefix: string;
      product_img_url?: string;
      embeddedImage?: { buffer: Buffer; mimetype: string; originalname: string };
    };

    const prepared: PreparedRow[] = [];
    for (const r of validRows) {
      const c = categoryMap.get(this.normalizeNameKey(r.categorytitle));
      if (!c) {
        failures.push({
          rowNumber: r.rowNumber,
          reason: `Category not found/created: ${r.categorytitle}`,
        });
        continue;
      }
      const b = brandMap.get(this.normalizeNameKey(r.brandtitle));
      if (!b) {
        failures.push({
          rowNumber: r.rowNumber,
          reason: `Brand not found/created: ${r.brandtitle}`,
        });
        continue;
      }

      const brandSeg = this.sanitizeSkuSegment(b.name);
      const catSeg = this.sanitizeSkuSegment(c.name);
      if (!brandSeg || !catSeg) {
        failures.push({
          rowNumber: r.rowNumber,
          reason: "Invalid brand/category for SKU generation",
        });
        continue;
      }

      prepared.push({
        rowNumber: r.rowNumber,
        title: r.title,
        description: r.description,
        price: r.price,
        stock_quantity: r.stock_quantity,
        category: c,
        brand: b,
        currency: r.currency,
        skuPrefix: `${brandSeg}-${catSeg}`,
        product_img_url: r.product_img_url,
        embeddedImage: r.embeddedImage,
      });
    }

    const prefixes = Array.from(new Set(prepared.map((p) => p.skuPrefix)));
    const nextSeqMap = new Map<string, number>();
    for (const prefix of prefixes) {
      const last = await this.productRepository
        .createQueryBuilder("p")
        .select(["p.sku"])
        .where("p.sku LIKE :pattern", { pattern: `${prefix}-%` })
        .orderBy("p.sku", "DESC")
        .limit(1)
        .getOne();
      nextSeqMap.set(prefix, this.parseSkuSequence((last as any)?.sku) + 1);
    }

    const preparedWithSku = prepared.map((p) => {
      const next = nextSeqMap.get(p.skuPrefix) || 1;
      nextSeqMap.set(p.skuPrefix, next + 1);
      const sku = `${p.skuPrefix}-${String(next).padStart(4, "0")}`;
      return { ...p, sku };
    });

    const chunkSize = 10;
    const chunks = this.chunkArray(preparedWithSku, chunkSize);

    let createdCount = 0;
    const createdSkus: string[] = [];

    for (const chunk of chunks) {
      const hasEmbedded = chunk.some((r) => !!r.embeddedImage && !r.product_img_url);

      const entities = chunk.map((r) => ({
        title: r.title,
        description: r.description || null,
        price: r.price,
        stock_quantity: r.stock_quantity,
        category_id: r.category.id,
        brand_id: r.brand.id,
        currency: r.currency,
        sku: (r as any).sku,
        product_img_url: r.product_img_url || null,
      }));

      if (!hasEmbedded) {
        try {
          await this.productRepository.insert(entities as any);
          createdCount += entities.length;
          createdSkus.push(...chunk.map((c: any) => c.sku));
          continue;
        } catch {
          for (let i = 0; i < entities.length; i++) {
            try {
              await this.productRepository.insert(entities[i] as any);
              createdCount += 1;
              createdSkus.push((chunk[i] as any).sku);
            } catch (e: any) {
              failures.push({
                rowNumber: chunk[i].rowNumber,
                reason: e?.message || "Failed to insert product",
              });
            }
          }
          continue;
        }
      }

      for (let i = 0; i < entities.length; i++) {
        const row = chunk[i];
        try {
          const res = await this.productRepository
            .createQueryBuilder()
            .insert()
            .into(Product)
            .values(entities[i] as any)
            .returning(["id"])
            .execute();

          createdCount += 1;
          createdSkus.push((row as any).sku);

          const insertedId =
            (res as any)?.identifiers?.[0]?.id ||
            (res as any)?.generatedMaps?.[0]?.id;

          if (
            insertedId &&
            row.embeddedImage &&
            !row.product_img_url
          ) {
            try {
              const url = await this.uploadProductImageToFilesBackend(
                String(insertedId),
                row.embeddedImage,
                authorizationHeader
              );

              await this.productRepository.update(
                { id: String(insertedId) } as any,
                { product_img_url: url } as any
              );
            } catch (e: any) {
              failures.push({
                rowNumber: row.rowNumber,
                reason: e?.message || "Image upload failed (product created without image)",
              });
            }
          }
        } catch (e: any) {
          failures.push({
            rowNumber: row.rowNumber,
            reason: e?.message || "Failed to insert product",
          });
        }
      }
    }

    const totalRows = nonEmptyRows;
    const processedRows = nonEmptyRows;

    return ResponseHelper.success(
      {
        totalRows,
        processedRows,
        createdCount,
        failedCount: failures.length,
        failures,
        createdSkus,
      },
      "Bulk upload processed",
      "Product",
      200
    );
  }

  async create(
    createProductDto: CreateProductDto,
    fileOrAuthorizationHeader?:
      | { buffer: Buffer; mimetype: string; originalname: string }
      | string,
    authorizationHeader?: string
  ): Promise<ApiResponse<Product>> {
    const authHeader =
      typeof fileOrAuthorizationHeader === "string"
        ? fileOrAuthorizationHeader
        : authorizationHeader;

    const {
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
      product_img_url,
      is_active,
    } = createProductDto;

    const category = await this.categoryRepository.findOne({
      where: { id: category_id },
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    const brand = await this.brandRepository.findOne({ where: { id: brand_id } });

    if (!brand) {
      throw new BadRequestException("Brand not found");
    }

    const sku = await this.generateSku(brand.name, category.name);

    const product = this.productRepository.create({
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
      sku,
      product_img_url,
      ...(typeof is_active === "boolean" ? { is_active } : {}),
    });

    const savedProduct = await this.productRepository.save(product);

    const productWithRelations = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ["category", "brand"],
    });

    return ResponseHelper.success(
      productWithRelations!,
      "Product created successfully",
      "Product",
      201
    );
  }

  async update(
    updateProductDto: UpdateProductDto,
    fileOrAuthorizationHeader?:
      | { buffer: Buffer; mimetype: string; originalname: string }
      | string,
    authorizationHeader?: string
  ): Promise<ApiResponse<Product>> {
    const authHeader =
      typeof fileOrAuthorizationHeader === "string"
        ? fileOrAuthorizationHeader
        : authorizationHeader;

    const {
      id,
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
      product_img_url,
      is_active,
    } = updateProductDto;

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const category = await this.categoryRepository.findOne({
      where: { id: category_id },
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    const brand = await this.brandRepository.findOne({ where: { id: brand_id } });

    if (!brand) {
      throw new BadRequestException("Brand not found");
    }

    const updateData: Partial<Omit<UpdateProductDto, "id">> & {
      product_img_url?: string;
    } = {
      title,
      description,
      price,
      stock_quantity,
      category_id,
      brand_id,
      currency,
    };

    if (typeof is_active === "boolean") {
      (updateData as any).is_active = is_active;
    }

    const previousUrl = (product as any).product_img_url as string | undefined;
    const previousFileName = previousUrl
      ? this.extractProductsFileNameFromUrl(previousUrl)
      : null;

    const nextUrl = typeof product_img_url === "string" ? product_img_url : undefined;
    if (typeof nextUrl === "string") {
      updateData.product_img_url = nextUrl;
    }

    await this.productRepository.update(id, updateData);

    if (
      typeof nextUrl === "string" &&
      previousFileName &&
      previousUrl &&
      nextUrl.trim() !== "" &&
      nextUrl !== previousUrl
    ) {
      try {
        await this.deleteProductImageFromFilesBackend(previousFileName, authHeader);
      } catch {
        // Best-effort cleanup only
      }
    }

    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "brand"],
    });

    return ResponseHelper.success(
      updatedProduct!,
      "Product updated successfully",
      "Product",
      200
    );
  }

  async getById(id: string): Promise<ApiResponse<Product>> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["category", "brand"],
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return ResponseHelper.success(product, "Product found", "Product", 200);
  }

  async getAll(
    paginationDto: PaginationDto,
    search?: string
  ): Promise<PaginatedApiResponse<Product>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.brand", "brand")
      .orderBy("product.created_at", "DESC")
      .skip(skip)
      .take(limit);

    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("product.title ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("product.sku ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("product.currency ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("category.name ILIKE :search", {
              search: `%${trimmedSearch}%`,
            })
            .orWhere("brand.name ILIKE :search", {
              search: `%${trimmedSearch}%`,
            });
        })
      );
    }

    const [products, total] = await qb.getManyAndCount();

    return ResponseHelper.paginated(
      products,
      page,
      limit,
      total,
      "products",
      "Products retrieved successfully",
      "Product"
    );
  }

  async delete(
    deleteProductDto: DeleteProductDto,
    authorizationHeader?: string
  ): Promise<ApiResponse<null>> {
    const { id } = deleteProductDto;

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const previousUrl = (product as any).product_img_url as string | undefined;
    const previousFileName = previousUrl
      ? this.extractProductsFileNameFromUrl(previousUrl)
      : null;

    await this.productRepository.remove(product);

    if (previousFileName) {
      try {
        await this.deleteProductImageFromFilesBackend(
          previousFileName,
          authorizationHeader
        );
      } catch {
        // Best-effort cleanup only
      }
    }

    return ResponseHelper.success(
      null,
      "Product deleted successfully",
      "Product",
      200
    );
  }
}
