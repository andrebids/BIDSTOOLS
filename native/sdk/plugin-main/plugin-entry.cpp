#include "tool-registry.h"
#include "notifier-registry.h"

namespace bidstools {
namespace native_sdk {

void initialize_plugin() {
  register_dimension_tools();
  register_dimension_notifiers();
}

}  // namespace native_sdk
}  // namespace bidstools
