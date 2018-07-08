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

import {
  h,
  app
} from 'hyperapp';

import {
  Box,
  BoxContainer,
  Button,
  TextField
} from '@osjs/gui';

const createPopup = ([initialState, initialActions, children]) => ($root, cb) => app(
  Object.assign({}, initialState),
  Object.assign({
    getState: () => state => state
  }, initialActions),
  (state, actions) => 
    h(Box, {}, [
      h(Box, {grow: 1, padding: false}, children(state, actions)),
      h(BoxContainer, {justify: 'flex-end'}, [
        h(Button, {onclick: () => cb(actions.getState())}, 'OK'),
        h(Button, {onclick: () => cb(null)}, 'Cancel')
      ])
    ]),
  $root
);

const createResizePopup = (image) => ([
  {
    width: image.width,
    height: image.height
  },
  {
    setWidth: width => state => ({width: parseInt(width, 10)}),
    setHeight: height => state => ({height: parseInt(height, 10)})
  },
  (state, actions) => ([
    h(BoxContainer, {orientation: 'horizontal'}, [
      h('div', {}, 'Width'),
      h(TextField, {type: 'number', value: state.width, oninput: (ev, value) => actions.setWidth(value)}),
    ]),
    h(BoxContainer, {orientation: 'horizontal'}, [
      h('div', {}, 'Height'),
      h(TextField, {type: 'number', value: state.height, oninput: (ev, value) => actions.setHeight(value)})
    ])
  ])
]);

const popupTypes = {
  resize: actions => createResizePopup(actions.getImage())
};

export const popupFactory = (core, proc, win) => (name, actions, cb) => {
  proc.createWindow({
    title: name,
    parent: win,
    gravity: 'center',
    dimension: {width: 300, height: 300},
    attributes: {modal: true}
  }).render(($content, popup) => {
    const found = popupTypes[name];
    if (found) {
      const content = found(actions);

      createPopup(content)($content, result => {
        if (result !== null) {
          cb(result);
        }

        popup.destroy();
      });

      popup.focus();
    }
  });
};
