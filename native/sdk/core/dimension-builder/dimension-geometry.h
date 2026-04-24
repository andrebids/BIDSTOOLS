#ifndef BIDSTOOLS_NATIVE_SDK_CORE_DIMENSION_BUILDER_DIMENSION_GEOMETRY_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_DIMENSION_BUILDER_DIMENSION_GEOMETRY_H_

#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class DimensionGeometryService {
 public:
  DimensionPlacement build_line_placement(const LineSourceRef& source, double offset_distance, DimensionOrientation orientation) const;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
