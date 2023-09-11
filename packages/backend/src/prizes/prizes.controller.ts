import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrizeProposalsService } from './services/prizes-proposals.service';
import { CreatePrizeProposalDto } from './dto/create-prize-proposal.dto';

import {
  ApiOperation,
  ApiHeader,
  ApiBody,
  ApiResponse,
  getSchemaPath,
  ApiParam,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InfinityPaginationResultType } from 'src/utils/types/infinity-pagination-result.type';
import { PrizeProposals } from './entities/prize-proposals.entity';
import { infinityPagination } from 'src/utils/infinity-pagination';

import { ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth.guard';

class PrizeProposalsPaginationResult
  implements InfinityPaginationResultType<PrizeProposals>
{
  data: PrizeProposals[];
  hasNextPage: boolean;
  @ApiProperty({ type: [PrizeProposals] })
  results: PrizeProposals[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

@ApiTags('prizes')
@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizeProposalsService: PrizeProposalsService) {}

  @Post('/proposals')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Proposal of a Prize  by passing Prize data ',
  })
  @ApiBody({
    description: 'Request body to create a prize',
    type: CreatePrizeProposalDto,
  })
  @ApiBearerAuth('access-token')
  create(
    @Body() createPrizeProposalDto: CreatePrizeProposalDto,
    @Request() req,
  ) {
    console.log({ createPrizeProposalDto });
    console.log(req.user, 'user');
    return this.prizeProposalsService.create(
      createPrizeProposalDto,
      req.user.userId,
    );
  }

  @Get('/proposals/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'The proposals were returned successfully',
    type: PrizeProposalsPaginationResult,
  })
  @ApiParam({
    name: 'userId',
    type: String,
  })
  async getProposalsBy(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Param('userId') userId,
  ): Promise<InfinityPaginationResultType<PrizeProposals>> {
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.prizeProposalsService.findByUserWithPagination(
        {
          limit,
          page,
        },
        userId,
      ),
      { page, limit },
    );
  }
  @Get('/proposals/:id')
  @ApiResponse({
    status: 200,
    description: 'The proposals were returned successfully',
    type: PrizeProposalsPaginationResult,
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  async getProposal(@Param('id') id: string) {
    return await this.prizeProposalsService.findOne(id);
  }

  @Post('/proposals/accept/:id')
  @ApiResponse({
    status: 200,
    description: 'The Proposals was Approved',
  })
  @UseGuards(AuthGuard)
  @ApiParam({
    name: 'id',
    type: String,
  })
  async approveProposal(@Param('id') id: string) {
    return await this.prizeProposalsService.approve(id);
  }
}
