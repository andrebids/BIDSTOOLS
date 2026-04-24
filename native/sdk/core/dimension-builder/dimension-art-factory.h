#ifndef BIDSTOOLS_NATIVE_SDK_CORE_DIMENSION_BUILDER_DIMENSION_ART_FACTORY_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_DIMENSION_BUILDER_DIMENSION_ART_FACTORY_H_

#include <string>
#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

struct CreatedDimensionArt {
  std::string group_id;
};

class DimensionArtFactory {
 public:
  CreatedDimensionArt create_dimension_art(const DimensionRecord& record) const;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
