#ifndef BIDSTOOLS_NATIVE_SDK_CORE_DIMENSION_LINKING_DIMENSION_LINK_STORE_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_DIMENSION_LINKING_DIMENSION_LINK_STORE_H_

#include <string>
#include <vector>
#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class DimensionLinkStore {
 public:
  void write_dimension_metadata(const std::string& group_id, const DimensionRecord& record);
  std::vector<std::string> find_dimensions_by_source(const std::string& source_object_id) const;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
