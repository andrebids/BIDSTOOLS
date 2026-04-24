(function (global) {
  function hasOpenDocuments() {
    return !!(app && app.documents && app.documents.length);
  }

  function getDocumentState() {
    if (!hasOpenDocuments()) {
      return {
        ok: false,
        message: "Open an Illustrator document to inspect the selection."
      };
    }

    try {
      if (!app.activeDocument) {
        return {
          ok: false,
          message: "Open an Illustrator document to inspect the selection."
        };
      }

      return {
        ok: true,
        document: app.activeDocument
      };
    } catch (error) {
      return {
        ok: false,
        message: "Unable to access the active Illustrator document."
      };
    }
  }

  function getSelectionLength(selectionRef) {
    if (!selectionRef || typeof selectionRef.length !== "number") {
      return 0;
    }

    return selectionRef.length;
  }

  function getSingleSelectionState(documentRef) {
    var selectionRef = documentRef && documentRef.selection;
    var selectionLength = getSelectionLength(selectionRef);

    if (!selectionLength) {
      return {
        ok: false,
        message: "Select one object to populate the panel."
      };
    }

    if (selectionLength !== 1) {
      return {
        ok: false,
        message: "Select a single object. Multiple selections are not supported in v1."
      };
    }

    if (!selectionRef[0]) {
      return {
        ok: false,
        message: "The current selection could not be read from Illustrator."
      };
    }

    return {
      ok: true,
      item: selectionRef[0]
    };
  }

  function requireDocument() {
    var state = getDocumentState();
    if (!state.ok) {
      throw new Error(state.message);
    }

    return state.document;
  }

  function requireSingleSelection(documentRef) {
    var state = getSingleSelectionState(documentRef);
    if (!state.ok) {
      throw new Error(state.message);
    }

    return state.item;
  }

  global.BIDSTOOLS.guards = {
    getDocumentState: getDocumentState,
    getSingleSelectionState: getSingleSelectionState,
    requireDocument: requireDocument,
    requireSingleSelection: requireSingleSelection
  };
})(this);
