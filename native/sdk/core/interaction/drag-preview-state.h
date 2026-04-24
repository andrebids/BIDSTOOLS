#ifndef BIDSTOOLS_NATIVE_SDK_CORE_INTERACTION_DRAG_PREVIEW_STATE_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_INTERACTION_DRAG_PREVIEW_STATE_H_

#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

struct DragPreviewState {
  bool active;
  DimensionPlacement placement;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
