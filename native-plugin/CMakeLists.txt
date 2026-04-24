cmake_minimum_required(VERSION 3.21)

project(BIDSTOOLSSelectionNotifier VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(ILLUSTRATOR_SDK_DIR "$ENV{ILLUSTRATOR_SDK_DIR}" CACHE PATH "Path to the Adobe Illustrator SDK root")

if(NOT ILLUSTRATOR_SDK_DIR)
  message(FATAL_ERROR "Set ILLUSTRATOR_SDK_DIR to the Illustrator SDK root before configuring.")
endif()

add_library(BIDSTOOLSSelectionNotifier SHARED
  src/PluginMain.cpp
  src/BIDSTOOLSSelectionNotifierPlugin.cpp
  src/BIDSTOOLSSelectionSignature.cpp
  src/BIDSTOOLSCEPDispatcher.cpp
)

target_include_directories(BIDSTOOLSSelectionNotifier
  PRIVATE
    ${ILLUSTRATOR_SDK_DIR}/illustratorapi
    ${ILLUSTRATOR_SDK_DIR}/illustratorapi/illustrator
    ${ILLUSTRATOR_SDK_DIR}/illustratorapi/ate
    ${ILLUSTRATOR_SDK_DIR}/illustratorapi/adm
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_definitions(BIDSTOOLSSelectionNotifier
  PRIVATE
    NOMINMAX
    _CRT_SECURE_NO_WARNINGS
    BIDSTOOLS_SELECTION_EVENT_NAME="com.bidstools.selectionChanged"
    BIDSTOOLS_EXTENSION_ID="com.bidstools.measure.panel"
)

set_target_properties(BIDSTOOLSSelectionNotifier PROPERTIES
  OUTPUT_NAME "BIDSTOOLSSelectionNotifier"
  PREFIX ""
  SUFFIX ".aip"
)

if(MSVC)
  target_compile_options(BIDSTOOLSSelectionNotifier PRIVATE /W4 /permissive-)
endif()
