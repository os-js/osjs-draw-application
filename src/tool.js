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

/*
 * The list of tools
 */
export const tools = {
  pointer: {
    label: 'Cursor'
  },

  pencil: {
    label: 'Pencil',

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
    label: 'Rectangle',

    mousemove: ({tool, tempContext, current, diff, start, width, height}) => {
      tempContext.clearRect(0, 0, width, height);
      tempContext.fillRect(start.x, start.y, diff.x, diff.y);
      if (tool.stroke) {
        tempContext.strokeRect(start.x, start.y, diff.x, diff.y);
      }
    }
  },

  square: {
    label: 'Square',

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
    label: 'Oval',

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
    label: 'Circle',

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
