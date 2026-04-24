#include "metadata-reader.h"

namespace bidstools {
namespace native_sdk {

std::optional<DimensionRecord> MetadataReader::read_dimension_record(const std::string& group_id) const {
  (void)group_id;
  return std::nullopt;
}

}  // namespace native_sdk
}  // namespace bidstools
