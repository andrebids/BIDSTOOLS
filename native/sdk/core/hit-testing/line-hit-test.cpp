#include "line-hit-test.h"

namespace bidstools {
namespace native_sdk {

std::optional<LineSourceRef> LineHitTestService::hit_test_at_cursor(const Point2D& cursor_position) const {
  (void)cursor_position;
  return std::nullopt;
}

}  // namespace native_sdk
}  // namespace bidstools
