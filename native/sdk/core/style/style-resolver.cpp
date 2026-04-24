#include "style-resolver.h"

namespace bidstools {
namespace native_sdk {

DimensionStyle StyleResolver::default_dimension_style() const {
  return {"#ff2a2a", "#ff2a2a", 10.0, 0.75, 7.0};
}

}  // namespace native_sdk
}  // namespace bidstools
