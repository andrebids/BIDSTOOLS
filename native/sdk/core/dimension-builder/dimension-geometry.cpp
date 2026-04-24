#include "dimension-geometry.h"

namespace bidstools {
namespace native_sdk {

DimensionPlacement DimensionGeometryService::build_line_placement(const LineSourceRef& source, double offset_distance, DimensionOrientation orientation) const {
  DimensionPlacement placement{};
  placement.offset_distance = offset_distance;
  placement.dimension_line_start = source.point_a;
  placement.dimension_line_end = source.point_b;
  placement.text_anchor.x = (source.point_a.x + source.point_b.x) / 2.0;
  placement.text_anchor.y = (source.point_a.y + source.point_b.y) / 2.0;

  if (orientation == DimensionOrientation::kHorizontal) {
    placement.dimension_line_start.y += offset_distance;
    placement.dimension_line_end.y += offset_distance;
    placement.text_anchor.y += offset_distance;
  } else if (orientation == DimensionOrientation::kVertical) {
    placement.dimension_line_start.x += offset_distance;
    placement.dimension_line_end.x += offset_distance;
    placement.text_anchor.x += offset_distance;
  }

  return placement;
}

}  // namespace native_sdk
}  // namespace bidstools
