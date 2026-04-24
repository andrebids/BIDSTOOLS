#include "dimension-art-factory.h"

namespace bidstools {
namespace native_sdk {

CreatedDimensionArt DimensionArtFactory::create_dimension_art(const DimensionRecord& record) const {
  CreatedDimensionArt art{};
  art.group_id = record.dimension_id;
  return art;
}

}  // namespace native_sdk
}  // namespace bidstools
