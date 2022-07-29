/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) Anders Evenrud <andersevenrud@gmail.com>
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

import iconCursor from './icons/stock-cursor-16.png';
import iconPicker from './icons/stock-color-pick-from-screen-16.png';
import iconFile from './icons/stock-tool-bucket-fill-16.png';
import iconPath from './icons/stock-tool-path-16.png';
import iconPencil from './icons/stock-tool-pencil-16.png';
import iconRectangle from './icons/stock-shape-rectangle-16.png';
import iconSquare from './icons/stock-shape-square-16.png';
import iconOval from './icons/stock-shape-ellipse-16.png';
import iconCircle from './icons/stock-shape-circle-16.png';

const rgbToHex = (r, g, b) => '#' + [
  parseInt(r, 10).toString(16),
  parseInt(g, 10).toString(16),
  parseInt(b, 10).toString(16)
].map(val => String(val).padStart(2, '0')).join('');

/*
 * The list of tools
 */
export const tools = {
  pointer: {
    label: 'LBL_CURSOR',
    icon: iconCursor
  },

  picker: {
    label: 'LBL_PICKER',
    icon: iconPicker,

    mousedown: ({a, ev, start, context, width, height}) => {
      const px = parseInt(start.x, 10);
      const py = parseInt(start.y, 10);
      const data = context.getImageData(0, 0, width, height).data;
      const index = (px + py * width) * 4;

      const hex = rgbToHex(
        data[index + 0],
        data[index + 1],
        data[index + 2],
        data[index + 3]
      );

      if (ev.shiftKey || ev.button > 0) {
        a.setBackground(hex);
      } else {
        a.setForeground(hex);
      }
    }
  },

  fill: {
    label: 'LBL_FILL',
    icon: iconFile,

    mousedown: ({ev, context, tool, width, height}) => {
      const t = (ev.shiftKey || ev.button > 0) ? 'background' : 'foreground';
      context.fillStyle = tool[t];
      context.fillRect(0, 0, width, height);
    }
  },

  path: {
    label: 'LBL_PATH',
    icon: iconPath,

    mousedown: ({tool, tempContext}) => {
      // Flips the colors
      tempContext.strokeStyle = tool.foreground;
    },

    mousemove: ({tempContext, start, current, width, height}) => {
      tempContext.clearRect(0, 0, width, height);
      tempContext.beginPath();
      tempContext.moveTo(current.x, current.y);
      tempContext.lineTo(start.x, start.y);
      tempContext.closePath();
      tempContext.stroke();
    }
  },

  pencil: {
    label: 'LBL_PENCIL',
    icon: iconPencil,

    mousedown: ({tool, tempContext}) => {
      // Flips the colors
      tempContext.strokeStyle = tool.foreground;
    },

    mousemove: ({tempContext, prev, current}) => {
      tempContext.beginPath();
      tempContext.moveTo(prev.x, prev.y);
      tempContext.lineTo(current.x, current.y);
      tempContext.stroke();
      tempContext.closePath();
    }
  },

  rect: {
    label: 'LBL_RECTANGLE',
    icon: iconRectangle,

    mousemove: ({tool, tempContext, current, diff, start, width, height}) => {
      tempContext.clearRect(0, 0, width, height);
      tempContext.fillRect(start.x, start.y, diff.x, diff.y);
      if (tool.stroke) {
        tempContext.strokeRect(start.x, start.y, diff.x, diff.y);
      }
    }
  },

  square: {
    label: 'LBL_SQUARE',
    icon: iconSquare,

    mousemove: ({tool, tempContext, current, diff, start, width, height}) => {
      tempContext.clearRect(0, 0, width, height);

      const w = Math.abs(current.x - start.x) * (current.x < start.x ? -1 : 1);
      const h = Math.abs(w) * (current.y < start.y ? -1 : 1);

      tempContext.fillRect(start.x, start.y, w, h);
      if (tool.stroke) {
        tempContext.strokeRect(start.x, start.y, w, h);
      }
    }
  },

  oval: {
    label: 'LBL_OVAL',
    icon: iconOval,

    mousemove: ({tool, tempContext, current, diff, start, width, height}) => {
      tempContext.clearRect(0, 0, width, height);

      tempContext.beginPath();
      tempContext.moveTo(start.x, start.y - diff.y * 2); // A1
      tempContext.bezierCurveTo(
        start.x + diff.x * 2, start.y - diff.y * 2, // C1
        start.x + diff.x * 2, start.y + diff.y * 2, // C2
        start.x, start.y + diff.y * 2); // A2

      tempContext.bezierCurveTo(
        start.x - diff.x * 2, start.y + diff.y * 2, // C3
        start.x - diff.x * 2, start.y - diff.y * 2, // C4
        start.x, start.y - diff.y * 2); // A1

      tempContext.closePath();
      if (tool.stroke) {
        tempContext.stroke();
      }
      tempContext.fill();
    }
  },

  circle: {
    label: 'LBL_CIRCLE',
    icon: iconCircle,

    mousemove: ({tool, tempContext, current, diff, start, width, height}) => {
      tempContext.clearRect(0, 0, width, height);

      const x = Math.abs(start.x - current.x);
      const y = Math.abs(start.y - current.y);
      const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

      if (r > 0) {
        tempContext.beginPath();
        tempContext.arc(start.x, start.y, r, 0, Math.PI * 2, true);
        tempContext.closePath();
        if (tool.stroke) {
          tempContext.stroke();
        }
        tempContext.fill();
      }
    }
  }
};
