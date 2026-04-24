#ifndef BIDSTOOLS_NATIVE_SDK_CORE_METADATA_METADATA_WRITER_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_METADATA_METADATA_WRITER_H_

#include <string>
#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class MetadataWriter {
 public:
  void write_dimension_record(const std::string& group_id, const DimensionRecord& record);
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
