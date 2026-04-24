#ifndef BIDSTOOLS_NATIVE_SDK_CORE_SCALE_NATIVE_SCALE_RESOLVER_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_SCALE_NATIVE_SCALE_RESOLVER_H_

#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class NativeScaleResolver {
 public:
  ScaleDefinition default_scale() const;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
