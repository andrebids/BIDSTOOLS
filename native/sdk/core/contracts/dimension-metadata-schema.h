#ifndef BIDSTOOLS_NATIVE_SDK_CORE_CONTRACTS_DIMENSION_METADATA_SCHEMA_H_
#define BIDSTOOLS_NATIVE_SDK_CORE_CONTRACTS_DIMENSION_METADATA_SCHEMA_H_

#include <string>

namespace bidstools {
namespace native_sdk {

struct DimensionMetadataKeys {
  static constexpr const char* kRootType = "bidstools.type";
  static constexpr const char* kVersion = "bidstools.version";
  static constexpr const char* kDimensionId = "bidstools.dimensionId";
  static constexpr const char* kKind = "bidstools.kind";
  static constexpr const char* kOrientation = "bidstools.orientation";
  static constexpr const char* kSourceObjectId = "bidstools.sourceObjectId";
  static constexpr const char* kSourceSegmentId = "bidstools.sourceSegmentId";
  static constexpr const char* kOffsetDistance = "bidstools.offsetDistance";
  static constexpr const char* kScaleMode = "bidstools.scaleMode";
  static constexpr const char* kScaleDefinition = "bidstools.scaleDefinition";
  static constexpr const char* kLineColor = "bidstools.style.lineColor";
  static constexpr const char* kTextColor = "bidstools.style.textColor";
  static constexpr const char* kFontSize = "bidstools.style.fontSize";
  static constexpr const char* kStrokeWidth = "bidstools.style.strokeWidth";
  static constexpr const char* kArrowSize = "bidstools.style.arrowSize";
  static constexpr const char* kLinkStatus = "bidstools.linkStatus";
};

}  // namespace native_sdk
}  // namespace bidstools

#endif
