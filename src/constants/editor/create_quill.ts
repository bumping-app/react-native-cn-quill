export const create_quill = ({
  id,
  toolbar,
  clipboard,
  keyboard,
  placeholder,
  theme,
  // imageDropAndPaste,
  customFonts = [],
  customJS,
  customJSwithquill,
}: {
  id: string;
  toolbar: 'false' | string;
  clipboard: string;
  keyboard: string;
  placeholder: string;
  // imageDropAndPaste: string;
  theme: 'snow' | 'bubble';
  customFonts: Array<string>;
  customJS: string;
  customJSwithquill: string;
}) => {
  let font = '';
  if (customFonts.length > 0) {
    const fontList = "'" + customFonts.join("','") + "'";
    font = `
    // Add fonts to whitelist
    var Font = Quill.import('formats/font');
    Font.whitelist = [${fontList}];
    Quill.register(Font, true);

    `;
  }
  let clipboardModule = '';
  if (clipboard) {
    clipboardModule = `clipboard: ${clipboard},`;
  }

  let modules = `toolbar: ${toolbar},`;

  if (clipboard) {
    modules += `clipboard: ${clipboard},`;
  }
  if (keyboard) {
    modules += `keyboard: ${keyboard},`;
  }

  // modules += `imageDropAndPaste: true,`;

  if (true) {
    modules += `history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    },`;
  }

  return `
  <script>
  
  ${font}
  ${customJS}
  var quill = new Quill('#${id}', {
    modules: { ${modules} },
    placeholder: '${placeholder}',
    theme: '${theme}'
  });
  ${customJSwithquill}
  </script>
  `;
};
