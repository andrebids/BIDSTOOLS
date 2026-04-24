#ifndef BIDSTOOLS_NATIVE_SDK_CORE_INTERACTION_TOOL_SESSION_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_INTERACTION_TOOL_SESSION_H_

#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

enum class ToolSessionState {
  kIdle,
  kAwaitingSource,
  kDraggingOffset,
  kCommitting,
  kCancelled
};

class ToolSession {
 public:
  ToolSession();

  void begin();
  void begin_drag();
  void cancel();
  void commit();

  ToolSessionState state() const;

 private:
  ToolSessionState state_;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
