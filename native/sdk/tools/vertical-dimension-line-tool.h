#ifndef BIDSTOOLS_NATIVE_SDK_TOOLS_VERTICAL_DIMENSION_LINE_TOOL_H_
#define BIDSTOOLS_NATIVE_SDK_TOOLS_VERTICAL_DIMENSION_LINE_TOOL_H_

#include "native/sdk/core/interaction/tool-session.h"

namespace bidstools {
namespace native_sdk {

class VerticalDimensionLineTool {
 public:
  void activate();
  void cancel();

 private:
  ToolSession session_;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
