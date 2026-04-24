#ifndef BIDSTOOLS_NATIVE_SDK_CORE_CONTRACTS_DIMENSION_TYPES_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_CONTRACTS_DIMENSION_TYPES_H_

#include <string>

namespace bidstools {
namespace native_sdk {

enum class DimensionToolKind {
  kHorizontalLine,
  kVerticalLine,
  kHorizontalPoints,
  kVerticalPoints,
  kDiameter,
  kRadius,
  kLabel
};

enum class DimensionOrientation {
  kHorizontal,
  kVertical,
  kRadial,
  kFree
};

enum class LinkStatus {
  kLinked,
  kBroken,
  kNeedsReattach
};

inline std::string to_string(DimensionToolKind kind) {
  switch (kind) {
    case DimensionToolKind::kHorizontalLine: return "horizontalLine";
    case DimensionToolKind::kVerticalLine: return "verticalLine";
    case DimensionToolKind::kHorizontalPoints: return "horizontalPoints";
    case DimensionToolKind::kVerticalPoints: return "verticalPoints";
    case DimensionToolKind::kDiameter: return "diameter";
    case DimensionToolKind::kRadius: return "radius";
    case DimensionToolKind::kLabel: return "label";
  }

  return "unknown";
}

}  // namespace native_sdk
}  // namespace bidstools

#endif
