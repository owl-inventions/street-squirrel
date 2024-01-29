import { Controller, Get, Query } from '@nestjs/common';
import { MarkerService } from './marker.service';
import {
  GetPoiCoverageDto,
  GetPoiCoverageResponseDto,
} from './dto/getPoiCoverage.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('marker')
export class MarkerController {
  constructor(private markerService: MarkerService) {}

  @Get('poi-coverage')
  @ApiOkResponse({
    description: 'Get the average reachability of POIs',
    type: GetPoiCoverageResponseDto,
  })
  @ApiTags('POIs')
  @ApiOperation({ summary: 'get simplified environment analysis' })
  async function(
    @Query() getPoiCoverageDto: GetPoiCoverageDto,
  ): Promise<GetPoiCoverageResponseDto> {
    return this.markerService.getPoiCoverage(getPoiCoverageDto);
  }
}
