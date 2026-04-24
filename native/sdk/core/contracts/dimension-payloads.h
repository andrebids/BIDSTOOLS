#ifndef BIDSTOOLS_NATIVE_SDK_CORE_CONTRACTS_DIMENSION_PAYLOADS_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_CONTRACTS_DIMENSION_PAYLOADS_H_

#include <string>
#include "dimension-types.h"

namespace bidstools {
namespace native_sdk {

struct Point2D {
  double x;
  double y;
};

struct DimensionStyle {
  std::string line_color;
  std::string text_color;
  double font_size;
  double stroke_width;
  double arrow_size;
};

struct ScaleDefinition {
  std::string mode;
  std::string label;
  std::string drawn_unit;
  std::string real_unit;
  double drawn_value;
  double real_value;
  double factor_linear;
  double factor_area;
};

struct LineSourceRef {
  std::string source_object_id;
  std::string source_segment_id;
  int source_path_index;
  Point2D point_a;
  Point2D point_b;
};

struct DimensionPlacement {
  double offset_distance;
  Point2D text_anchor;
  Point2D dimension_line_start;
  Point2D dimension_line_end;
};

struct DimensionRecord {
  std::string dimension_id;
  DimensionToolKind kind;
  DimensionOrientation orientation;
  LineSourceRef source;
  DimensionPlacement placement;
  ScaleDefinition scale;
  DimensionStyle style;
  LinkStatus link_status;
};

struct DimensionCommitRequest {
  DimensionToolKind kind;
  DimensionOrientation orientation;
  LineSourceRef source;
  DimensionPlacement placement;
  ScaleDefinition scale;
  DimensionStyle style;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
