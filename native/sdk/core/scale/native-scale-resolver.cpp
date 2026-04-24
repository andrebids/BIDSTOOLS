#include "native-scale-resolver.h"

namespace bidstools {
namespace native_sdk {

ScaleDefinition NativeScaleResolver::default_scale() const {
  return {
    "document",
    "1:1",
    "mm",
    "m",
    1.0,
    0.001,
    0.001,
    0.000001
  };
}

}  // namespace native_sdk
}  // namespace bidstools
