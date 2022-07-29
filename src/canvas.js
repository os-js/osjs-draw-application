/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2020, Anders Evenrud <andersevenrud@gmail.com>
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

import {tools} from './tool.js';

/**
 * Creates a new canvas with context
 */
export const createCanvas = (width, height, className) => {
  const canvas = document.createElement('canvas');
  canvas.className = className;
  canvas.width = width;
  canvas.height = height;

  return [
    canvas,
    canvas.getContext('2d')
  ];
};

/**
 * Binds and resolves events to canvas actions
 */
export const createCanvasActions = ({
  a,
  canvas,
  context,
  tempCanvas,
  tempContext
}) => {
  const {width, height} = canvas;
  let start, current, diff, prev;
  let currentTool;
  let canvasPosition;

  const toolAction = (action, ev) =>
    (tools[currentTool.name][action] || function() {})({
      a, ev, start, current, prev, diff,
      context, tempContext,
      width, height,
      tool: a.getTool()
    });

  const onmousemove = ev => {
    current = {
      x: ev.clientX - canvasPosition.left,
      y: ev.clientY - canvasPosition.top
    };

    diff = {
      x: current.x - start.x,
      y: current.y - start.y
    };

    toolAction('mousemove', ev);

    prev = current;
  };

  const onmouseup = ev => {
    toolAction('mouseup', ev);

    window.removeEventListener('mousemove', onmousemove);
    window.removeEventListener('mouseup', onmouseup);

    context.drawImage(tempCanvas, 0, 0);
  };

  canvas.addEventListener('mousedown', ev => {
    currentTool = a.getTool();
    canvasPosition = canvas.getBoundingClientRect();

    const tool = a.getTool();
    tempContext.fillStyle = tool.foreground;
    tempContext.strokeStyle = tool.background;
    tempContext.lineWidth = tool.lineWidth;

    // eslint-disable-line no-multi-assign
    prev = start = {
      x: ev.clientX - canvasPosition.left,
      y: ev.clientY - canvasPosition.top
    };

    window.addEventListener('mousemove', onmousemove);
    window.addEventListener('mouseup', onmouseup);

    toolAction('mousedown', ev);
  });
};
