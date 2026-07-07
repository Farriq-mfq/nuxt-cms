import Image from "@tiptap/extension-image";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import ResizableImageView from "./ResizableImageView.vue";

export const ResizableImage = Image.extend({
  name: "image",

  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return { "data-image-id": attributes.id };
        },
        parseHTML: (element) => element.getAttribute("data-image-id"),
      },
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}` };
        },
        parseHTML: (element) =>
          element.style.width || element.getAttribute("width"),
      },
      align: {
        default: "center",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
        parseHTML: (element) => element.getAttribute("data-align") || "center",
      },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(ResizableImageView);
  },
});
