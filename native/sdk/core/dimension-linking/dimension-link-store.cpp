#include "dimension-link-store.h"

namespace bidstools {
namespace native_sdk {

void DimensionLinkStore::write_dimension_metadata(const std::string& group_id, const DimensionRecord& record) {
  (void)group_id;
  (void)record;
}

std::vector<std::string> DimensionLinkStore::find_dimensions_by_source(const std::string& source_object_id) const {
  (void)source_object_id;
  return {};
}

}  // namespace native_sdk
}  // namespace bidstools
