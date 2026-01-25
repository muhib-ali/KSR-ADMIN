import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogQueryDto } from './dto/blog-query.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: CreateBlogDto, createdBy: string): Promise<Blog> {
    const blog = this.blogRepository.create({
      ...createBlogDto,
      created_by: createdBy,
    });

    return await this.blogRepository.save(blog);
  }

  async findAll(query: BlogQueryDto): Promise<{ blogs: Blog[]; total: number }> {
    const { search, is_active, page = 1, limit = 10, sort_by = 'created_at', order = 'DESC' } = query;
    
    const where: FindOptionsWhere<Blog> = {};

    if (search) {
      where.heading = Like(`%${search}%`);
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const [blogs, total] = await this.blogRepository.findAndCount({
      where,
      order: {
        [sort_by]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { blogs, total };
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, updatedBy: string): Promise<Blog> {
    const blog = await this.findOne(id);

    Object.assign(blog, updateBlogDto, {
      updated_by: updatedBy,
    });

    return await this.blogRepository.save(blog);
  }

  async remove(id: string): Promise<void> {
    const blog = await this.findOne(id);
    
    await this.blogRepository.remove(blog);
  }

  async toggleActive(id: string, updatedBy: string): Promise<Blog> {
    const blog = await this.findOne(id);
    
    blog.is_active = !blog.is_active;
    blog.updated_by = updatedBy;
    
    return await this.blogRepository.save(blog);
  }
}
