#include "tool-session.h"

namespace bidstools {
namespace native_sdk {

ToolSession::ToolSession() : state_(ToolSessionState::kIdle) {}

void ToolSession::begin() {
  state_ = ToolSessionState::kAwaitingSource;
}

void ToolSession::begin_drag() {
  state_ = ToolSessionState::kDraggingOffset;
}

void ToolSession::cancel() {
  state_ = ToolSessionState::kCancelled;
}

void ToolSession::commit() {
  state_ = ToolSessionState::kCommitting;
}

ToolSessionState ToolSession::state() const {
  return state_;
}

}  // namespace native_sdk
}  // namespace bidstools

