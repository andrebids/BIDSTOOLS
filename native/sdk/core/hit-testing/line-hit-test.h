#ifndef BIDSTOOLS_NATIVE_SDK_CORE_HIT_TESTING_LINE_HIT_TEST_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_HIT_TESTING_LINE_HIT_TEST_H_

#include <optional>
#include "native/sdk/core/contracts/dimension-payloads.h"

namespace bidstools {
namespace native_sdk {

class LineHitTestService {
 public:
  std::optional<LineSourceRef> hit_test_at_cursor(const Point2D& cursor_position) const;
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
