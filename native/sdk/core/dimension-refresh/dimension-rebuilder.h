#ifndef BIDSTOOLS_NATIVE_SDK_CORE_DIMENSION_REFRESH_DIMENSION_REBUILDER_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_DIMENSION_REFRESH_DIMENSION_REBUILDER_H_

#include <string>

namespace bidstools {
namespace native_sdk {

class DimensionRebuilder {
 public:
  bool rebuild_dimension(const std::string& dimension_id);
  bool rebuild_dimensions_for_source(const std::string& source_object_id);
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
