#include "vertical-dimension-line-tool.h"

namespace bidstools {
namespace native_sdk {

void VerticalDimensionLineTool::activate() {
  session_.begin();
}

void VerticalDimensionLineTool::cancel() {
  session_.cancel();
}

}  // namespace native_sdk
}  // namespace bidstools
