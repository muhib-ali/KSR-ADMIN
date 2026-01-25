import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { Blog } from '../entities/blog.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Blogs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post('create')
  @ApiOperation({ 
    summary: 'Create a new blog post',
    description: 'Creates a new blog entry with heading, paragraph and optional image. Requires authentication.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Blog created successfully',
    schema: {
      example: {
        success: true,
        message: 'Blog created successfully',
        data: {
          id: "uuid-string",
          heading: "My First Blog",
          paragraph: "This is the content of my blog post...",
          blog_img: "https://example.com/image.jpg",
          is_active: true,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z"
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async create(@Body() createBlogDto: CreateBlogDto, @Request() req: any) {
    const blog = await this.blogsService.create(createBlogDto, req.user.id);
    return {
      success: true,
      message: 'Blog created successfully',
      data: blog,
    };
  }

  @Get('getAll')
  @ApiOperation({ 
    summary: 'Get all blogs with pagination and filtering',
    description: 'Retrieves a paginated list of blog posts. Supports search by heading, filter by active status, and sorting.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Blogs retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Blogs retrieved successfully',
        data: [
          {
            id: "uuid-string",
            heading: "My First Blog",
            paragraph: "This is the content...",
            blog_img: "https://example.com/image.jpg",
            is_active: true,
            created_at: "2024-01-01T00:00:00.000Z",
            updated_at: "2024-01-01T00:00:00.000Z"
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      }
    }
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search blogs by heading (case-insensitive)' })
  @ApiQuery({ name: 'is_active', required: false, description: 'Filter by active status (true/false)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort field: created_at, updated_at, heading (default: created_at)' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order: ASC or DESC (default: DESC)' })
  async findAll(@Query() query: BlogQueryDto) {
    const { blogs, total } = await this.blogsService.findAll(query);
    return {
      success: true,
      message: 'Blogs retrieved successfully',
      data: blogs,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  @Get('getById/:id')
  @ApiOperation({ 
    summary: 'Get a blog by ID',
    description: 'Retrieves a single blog post by its unique identifier.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Blog retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Blog retrieved successfully',
        data: {
          id: "uuid-string",
          heading: "My First Blog",
          paragraph: "This is the full content of the blog post...",
          blog_img: "https://example.com/image.jpg",
          is_active: true,
          created_by: "user-uuid",
          updated_by: "user-uuid",
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z"
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Blog not found - Invalid blog ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the blog (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  async findOne(@Param('id') id: string) {
    const blog = await this.blogsService.findOne(id);
    return {
      success: true,
      message: 'Blog retrieved successfully',
      data: blog,
    };
  }

  @Put('update/:id')
  @ApiOperation({ 
    summary: 'Update a blog',
    description: 'Updates an existing blog post. All fields are optional - only provided fields will be updated.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Blog updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Blog updated successfully',
        data: {
          id: "uuid-string",
          heading: "Updated Blog Title",
          paragraph: "Updated blog content...",
          blog_img: "https://example.com/new-image.jpg",
          is_active: true,
          updated_at: "2024-01-02T12:00:00.000Z"
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Blog not found - Invalid blog ID' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the blog (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @Request() req: any) {
    const blog = await this.blogsService.update(id, updateBlogDto, req.user.id);
    return {
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    };
  }

  @Put('toggle-active/:id')
  @ApiOperation({ 
    summary: 'Toggle blog active status',
    description: 'Toggles the is_active status of a blog post. Useful for soft delete/restore functionality.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Blog status updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Blog status updated successfully',
        data: {
          id: "uuid-string",
          heading: "My First Blog",
          paragraph: "This is the content...",
          blog_img: "https://example.com/image.jpg",
          is_active: false, // Changed from true to false
          updated_at: "2024-01-02T12:00:00.000Z"
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Blog not found - Invalid blog ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the blog (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  async toggleActive(@Param('id') id: string, @Request() req: any) {
    const blog = await this.blogsService.toggleActive(id, req.user.id);
    return {
      success: true,
      message: 'Blog status updated successfully',
      data: blog,
    };
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete a blog',
    description: 'Permanently deletes a blog post from the database. This action cannot be undone.'
  })
  @ApiResponse({ status: 204, description: 'Blog deleted successfully - No content returned' })
  @ApiResponse({ status: 404, description: 'Blog not found - Invalid blog ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the blog (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  async remove(@Param('id') id: string) {
    await this.blogsService.remove(id);
  }
}
