import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, Not } from "typeorm";
import { HomeCmsSection } from "../entities/home-cms-section.entity";
import { CreateCmsSectionDto } from "./dto/create-cms-section.dto";
import { UpdateCmsSectionDto } from "./dto/update-cms-section.dto";
import { CmsQueryDto } from "./dto/cms-query.dto";

export type CmsSectionWithSubsections = HomeCmsSection & {
  subsections: HomeCmsSection[];
};

const FILES_CMS_PATH = "/public/cms/";

@Injectable()
export class CmsService {
  private readonly filesBackendBaseUrl =
    process.env.FILES_BACKEND_URL || "http://localhost:3003";
  private readonly logger = new Logger(CmsService.name);

  constructor(
    @InjectRepository(HomeCmsSection)
    private readonly repo: Repository<HomeCmsSection>,
  ) {}

  /** Extract file name from URL if it points to our FILES backend /public/cms/ */
  private getCmsFileNameFromUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== "string") return null;
    const base = this.filesBackendBaseUrl.replace(/\/$/, "");
    const prefix = `${base}${FILES_CMS_PATH}`;
    if (!url.startsWith(prefix)) return null;
    const rest = url.slice(prefix.length);
    const fileName = rest.split("?")[0].trim();
    if (!fileName || /[/\\]/.test(fileName)) return null;
    return fileName;
  }

  private async deleteCmsImageFromFilesBackend(
    fileName: string,
    authorization?: string,
  ): Promise<void> {
    const fetchFn = (global as any).fetch;
    if (!fetchFn) return;
    const endpoint = `${this.filesBackendBaseUrl}/v1/cms/image/${encodeURIComponent(fileName)}`;
    const headers: Record<string, string> = {};
    if (authorization) headers["authorization"] = authorization;
    try {
      const res = await fetchFn(endpoint, { method: "DELETE", headers });
      if (res.ok) {
        this.logger.log(`[CmsService] Deleted CMS image from storage: ${fileName}`);
      } else {
        this.logger.warn(
          `[CmsService] Failed to delete CMS image ${fileName}: ${res.status}`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `[CmsService] Error calling FILES delete for ${fileName}:`,
        err,
      );
    }
  }

  async create(
    dto: CreateCmsSectionDto,
    createdBy: string,
  ): Promise<CmsSectionWithSubsections> {
    const sectionKey = dto.section_key.trim();
    const existing = await this.repo.findOne({
      where: { section_key: sectionKey, subsection_key: IsNull() },
    });
    if (existing) {
      throw new BadRequestException(
        `Section with key "${sectionKey}" already exists`,
      );
    }

    const main = this.repo.create({
      section_key: sectionKey,
      subsection_key: null,
      label: dto.label ?? null,
      title: dto.title ?? null,
      description: dto.description ?? null,
      section_img_url: dto.section_img_url ?? null,
      sort_order: 0,
      created_by: createdBy,
    });
    await this.repo.save(main);

    const subsections: HomeCmsSection[] = [];
    if (dto.subsections?.length) {
      for (let i = 0; i < dto.subsections.length; i++) {
        const sub = dto.subsections[i];
        const subRow = this.repo.create({
          section_key: sectionKey,
          subsection_key:
            sub.subsection_key ?? `sub_${i + 1}`,
          label: sub.label ?? null,
          title: sub.title ?? null,
          description: sub.description ?? null,
          section_img_url: sub.section_img_url ?? null,
          sort_order: sub.sort_order ?? i + 1,
          created_by: createdBy,
        });
        await this.repo.save(subRow);
        subsections.push(subRow);
      }
    }

    return { ...main, subsections };
  }

  async findAll(
    query: CmsQueryDto,
  ): Promise<{ rows: HomeCmsSection[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sort_by = "sort_order",
      order = "ASC",
    } = query;

    const qb = this.repo
      .createQueryBuilder("s")
      .where("s.subsection_key IS NULL");

    if (search?.trim()) {
      qb.andWhere(
        "(s.section_key ILIKE :search OR s.label ILIKE :search OR s.title ILIKE :search)",
        { search: `%${search.trim()}%` },
      );
    }

    qb.orderBy(`s.${sort_by}`, order);

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (rows.length > 0) {
      const sectionKeys = rows.map((r) => r.section_key);
      const counts = await this.repo
        .createQueryBuilder("s")
        .select("s.section_key", "section_key")
        .addSelect("COUNT(*)", "cnt")
        .where("s.section_key IN (:...keys)", { keys: sectionKeys })
        .andWhere("s.subsection_key IS NOT NULL")
        .groupBy("s.section_key")
        .getRawMany<{ section_key: string; cnt: string }>();
      const countMap = new Map(counts.map((c) => [c.section_key, Number(c.cnt)]));
      rows.forEach((r) => {
        (r as any).subsections_count = countMap.get(r.section_key) ?? 0;
      });
    }

    return { rows, total };
  }

  async findOne(id: string): Promise<CmsSectionWithSubsections> {
    const main = await this.repo.findOne({
      where: { id, subsection_key: IsNull() },
    });
    if (!main) {
      throw new NotFoundException(`CMS section with ID ${id} not found`);
    }

    const subsections = await this.repo.find({
      where: {
        section_key: main.section_key,
        subsection_key: Not(IsNull()),
      },
      order: { sort_order: "ASC" },
    });

    return { ...main, subsections };
  }

  async update(
    id: string,
    dto: UpdateCmsSectionDto,
    updatedBy: string,
    authorization?: string,
  ): Promise<CmsSectionWithSubsections> {
    const main = await this.repo.findOne({
      where: { id, subsection_key: IsNull() },
    });
    if (!main) {
      throw new NotFoundException(`CMS section with ID ${id} not found`);
    }

    const sectionKey = dto.section_key?.trim() ?? main.section_key;
    if (sectionKey !== main.section_key) {
      const existing = await this.repo.findOne({
        where: { section_key: sectionKey, subsection_key: IsNull() },
      });
      if (existing) {
        throw new BadRequestException(
          `Section with key "${sectionKey}" already exists`,
        );
      }
    }

    const existingSubs = await this.repo.find({
      where: { section_key: main.section_key },
    });

    const oldUrls = new Set<string>();
    if (main.section_img_url) oldUrls.add(main.section_img_url);
    existingSubs
      .filter((s) => s.subsection_key != null && s.section_img_url)
      .forEach((s) => s.section_img_url && oldUrls.add(s.section_img_url));

    const newUrls = new Set<string>();
    const newMainUrl =
      dto.section_img_url !== undefined ? dto.section_img_url : main.section_img_url;
    if (newMainUrl) newUrls.add(newMainUrl);
    if (dto.subsections) {
      dto.subsections.forEach((s) => {
        if (s.section_img_url) newUrls.add(s.section_img_url);
      });
    }

    const toDeleteUrls = [...oldUrls].filter((u) => !newUrls.has(u));
    for (const url of toDeleteUrls) {
      const fileName = this.getCmsFileNameFromUrl(url);
      if (fileName) {
        await this.deleteCmsImageFromFilesBackend(fileName, authorization);
      }
    }

    main.section_key = sectionKey;
    if (dto.label !== undefined) main.label = dto.label ?? null;
    if (dto.title !== undefined) main.title = dto.title ?? null;
    if (dto.description !== undefined)
      main.description = dto.description ?? null;
    if (dto.section_img_url !== undefined)
      main.section_img_url = dto.section_img_url ?? null;
    main.updated_by = updatedBy;
    await this.repo.save(main);

    if (dto.subsections !== undefined) {
      const toDelete = existingSubs.filter((s) => s.subsection_key != null);
      for (const s of toDelete) {
        await this.repo.remove(s);
      }
      for (let i = 0; i < dto.subsections.length; i++) {
        const sub = dto.subsections[i];
        const subRow = this.repo.create({
          section_key: main.section_key,
          subsection_key: sub.subsection_key ?? `sub_${i + 1}`,
          label: sub.label ?? null,
          title: sub.title ?? null,
          description: sub.description ?? null,
          section_img_url: sub.section_img_url ?? null,
          sort_order: sub.sort_order ?? i + 1,
          created_by: updatedBy,
          updated_by: updatedBy,
        });
        await this.repo.save(subRow);
      }
    }

    return this.findOne(main.id);
  }

  async remove(id: string, authorization?: string): Promise<void> {
    const main = await this.repo.findOne({
      where: { id, subsection_key: IsNull() },
    });
    if (!main) {
      throw new NotFoundException(`CMS section with ID ${id} not found`);
    }
    const all = await this.repo.find({
      where: { section_key: main.section_key },
    });

    const urlsToDelete: string[] = [];
    for (const row of all) {
      if (row.section_img_url) urlsToDelete.push(row.section_img_url);
    }
    for (const url of urlsToDelete) {
      const fileName = this.getCmsFileNameFromUrl(url);
      if (fileName) {
        await this.deleteCmsImageFromFilesBackend(fileName, authorization);
      }
    }

    for (const row of all) {
      await this.repo.remove(row);
    }
  }

  /** Public API: get all sections with subsections for home page (no auth). */
  async getHomeSections(): Promise<CmsSectionWithSubsections[]> {
    const mains = await this.repo.find({
      where: { subsection_key: IsNull(), is_active: true },
      order: { sort_order: "ASC" },
    });
    const result: CmsSectionWithSubsections[] = [];
    for (const main of mains) {
      const subOnly = await this.repo.find({
        where: {
          section_key: main.section_key,
          is_active: true,
          subsection_key: Not(IsNull()),
        },
        order: { sort_order: "ASC" },
      });
      result.push({ ...main, subsections: subOnly });
    }
    return result;
  }
}
