#ifndef BIDSTOOLS_NATIVE_SDK_CORE_PREVIEW_PREVIEW_RENDERER_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_PREVIEW_PREVIEW_RENDERER_H_

#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class PreviewRenderer {
 public:
  void show_preview(const DimensionCommitRequest& request);
  void update_preview(const DimensionCommitRequest& request);
  void clear_preview();
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
