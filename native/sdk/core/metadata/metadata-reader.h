#ifndef BIDSTOOLS_NATIVE_SDK_CORE_METADATA_METADATA_READER_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_METADATA_METADATA_READER_H_

#include <optional>
#include <string>
#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class MetadataReader {
 public:
  std::optional<DimensionRecord> read_dimension_record(const std::string& group_id) const;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
