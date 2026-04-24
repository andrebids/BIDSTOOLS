#ifndef BIDSTOOLS_NATIVE_SDK_CORE_STYLE_STYLE_RESOLVER_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_STYLE_STYLE_RESOLVER_H_

#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class StyleResolver {
 public:
  DimensionStyle default_dimension_style() const;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
