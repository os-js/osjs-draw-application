/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

import {h, app} from 'hyperapp';
import {BasicApplication} from '@osjs/common';
import {
  Box,
  BoxStyled,
  Menubar,
  MenubarItem,
  Toolbar,
  Statusbar,
  ToggleField,
  SelectField,
  Button
} from '@osjs/gui';
import {createCanvas, createCanvasActions} from './canvas.js';
import {popupFactory} from './popup.js';
import {tools} from './tool.js';

/*
 * Creates the toolbar buttons
 */
const createToolButtons = (current, actions, proc) => Object.keys(tools)
  .map(name => h(Button, {
    icon: proc.resource(tools[name].icon),
    label: tools[name].label,
    active: current && current.name === name,
    onclick: () => actions.buttonTool(name)
  }));

/*
 * Creates file menu items
 */
const createFileMenu = (current, actions) => ([
  {label: 'New', onclick: () => actions.menuNew()},
  {label: 'Open', onclick: () => actions.menuOpen()},
  {label: 'Save', disabled: !current, onclick: () => actions.menuSave()},
  {label: 'Save As...', onclick: () => actions.menuSaveAs()},
  {label: 'Quit', onclick: () => actions.menuQuit()}
]);

/*
 * Creates the image menu items
 */
const createImageMenu = actions => ([
  {label: 'Resize Scaled', onclick: () => actions.menuResizeImage()},
  {label: 'Resize Canvas', onclick: () => actions.menuResizeCanvas()}
]);

/*
 * Creates the application
 */
const createApplication = (core, proc, win, $content) => {
  const vfs = core.make('osjs/vfs');
  const popup = popupFactory(core, proc, win);
  const colorDialog = (color, cb) => core.make('osjs/dialog', 'color', {
    color
  }, (btn, value) => {
    if (btn === 'ok') {
      cb(value.hex);
    }
  });

  const basic = new BasicApplication(core, proc, win, {
    defaultFilename: 'New Image.png'
  });

  const menu = (ev, menu) => core.make('osjs/contextmenu').show({
    position: ev.target,
    menu
  });

  const [canvas, context] = createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT, 'render-canvas');
  const [tempCanvas, tempContext] = createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT, 'temp-canvas');

  const view = (state, actions) =>
    h(Box, {}, [
      h(Menubar, {}, [
        h(MenubarItem, {onclick: ev => actions.menuFile(ev)}, 'File'),
        h(MenubarItem, {onclick: ev => actions.menuImage(ev)}, 'Image')
      ]),
      h(Box, {grow: 1, orientation: 'vertical'}, [
        h(Toolbar, {
          class: 'draw-tools',
          orientation: 'horizontal'
        }, [
          ...createToolButtons(state.tool, actions, proc),
          h(Button, {}, [
            h('div', {
              style: {height: '1em', backgroundColor: state.tool.foreground},
              onclick: () => actions.buttonForeground()
            })
          ]),
          h(Button, {}, [
            h('div', {
              style: {height: '1em', backgroundColor: state.tool.background},
              onclick: () => actions.buttonBackground()
            })
          ]),
          h(ToggleField, {
            label: 'Stroke',
            checked: state.tool.stroke,
            onchange: (ev, value) => actions.setStroke(value)
          }),
          h(SelectField, {
            choices: {
              1: 1,
              2: 2,
              3: 3,
              4: 4,
              5: 5
            },
            value: state.tool.lineWidth,
            onchange: (ev, value) => actions.setLineWidth(value)
          })
        ]),
        h(BoxStyled, {class: 'draw-container', grow: 1}, h('div', {
          class: 'draw-area',
          oncreate: el => {
            el.appendChild(canvas);
            el.appendChild(tempCanvas);
          }
        }))
      ]),
      h(Statusbar, {}, [
        [
          `${state.image.width}x${state.image.height} px`,
          tools[state.tool.name].label,
          `F:${state.tool.foreground} B:${state.tool.background}`,
          `S:${state.tool.stroke ? 'on' : 'off'}`,
          `L:${state.tool.lineWidth}`
        ].join(' - ')
      ])
    ]);

  const setCanvasSize = (width, height) => {
    canvas.width = width;
    canvas.height = height;
    tempCanvas.width = width;
    tempCanvas.height = height;
  };

  const resizeCanvasScale = ({width, height}) => {
    const [cv, cc] = createCanvas(canvas.width, canvas.height, '');
    cc.drawImage(canvas, 0, 0);
    setCanvasSize(width, height);
    context.drawImage(cv, 0, 0, width, height);
  };

  const resizeCanvasSize = ({width, height}) => {
    const [cv, cc] = createCanvas(canvas.width, canvas.height, '');
    cc.drawImage(canvas, 0, 0);
    setCanvasSize(width, height);
    context.drawImage(cv, 0, 0);
  };

  const setCanvasImage = img => {
    setCanvasSize(img.width, img.height);
    context.drawImage(img, 0, 0);
  };

  const a = app({
    image: {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT
    },
    tool: {
      name: 'pointer',
      foreground: '#000000',
      background: '#ffffff',
      stroke: false,
      lineWidth: 1
    }
  }, {
    menuFile: ev => (state, actions) => menu(ev, createFileMenu(proc.args.file, actions)),
    menuImage: ev => (state, actions) => menu(ev, createImageMenu(actions)),
    menuNew: () => () => basic.createNew(),
    menuOpen: () => () => basic.createOpenDialog(),
    menuSave: () => (state, actions) => actions.save(),
    menuSaveAs: () => () => basic.createSaveDialog(),
    menuQuit: () => () => proc.destroy(),

    menuResizeImage: () => (state, actions) => popup('resize', actions, ({width, height}) => {
      resizeCanvasScale({width, height});
      actions.setSize({width, height});
    }),

    menuResizeCanvas: () => (state, actions) => popup('resize', actions, ({width, height}) => {
      resizeCanvasSize({width, height});
      actions.setSize({width, height});
    }),

    buttonForeground: () => (state, actions) => colorDialog(state.tool.foreground, color => {
      actions.setForeground(color);
    }),

    buttonBackground: () => (state, actions) => colorDialog(state.tool.background, color => {
      actions.setBackground(color);
    }),

    buttonTool: name => (state,  actions) => {
      //(tools[name].select || function() {})(refArguments);
      actions.setTool(name);
    },

    loadImage: (url) => (state, actions) => {
      const img = new Image();
      img.onload = () => {
        setCanvasImage(img);
        actions.setSize({width: img.width, height: img.height});
      };
      img.src = url;
    },

    save: () => state => {
      if (proc.args.file) {
        canvas.toBlob(blob => {
          vfs.writefile(proc.args.file, blob)
            .catch(error => console.error(error)); // FIXME: Dialog
        });
      }
    },

    load: item => (state, actions) => {
      vfs.url(item)
        .then(url => actions.loadImage(url))
        .catch(error => console.error(error)); // FIXME: Dialog
    },

    setSize: size => state => ({image: size}),
    setTool: name => state => ({tool: Object.assign({}, state.tool, {name})}),
    setForeground: foreground => state => ({tool: Object.assign({}, state.tool, {foreground})}),
    setBackground: background => state => ({tool: Object.assign({}, state.tool, {background})}),
    setStroke: stroke => state => ({tool: Object.assign({}, state.tool, {stroke})}),
    setLineWidth: lineWidth => state => ({tool: Object.assign({}, state.tool, {lineWidth})}),
    getTool: () => state => state.tool,
    getImage: () => state => state.image
  }, view, $content);

  createCanvasActions({a, canvas, context, tempCanvas, tempContext});

  proc.on('destroy', () => basic.destroy());
  basic.on('new-file', () => setCanvasSize(DEFAULT_WIDTH, DEFAULT_HEIGHT));
  basic.on('save-file', a.save);
  basic.on('open-file', a.load);
  basic.init();
  win.focus();
};

/*
 * Register package
 */
OSjs.make('osjs/packages').register('Draw', (core, args, options, metadata) => {
  const proc = core.make('osjs/application', {args, options, metadata});

  proc.createWindow({
    title: metadata.title.en_EN,
    dimension: {
      width: 500,
      height: 500
    }
  })
    .on('destroy', () => proc.destroy())
    .render(($content, win) => {
      createApplication(core, proc, win, $content);
    });

  return proc;
});
