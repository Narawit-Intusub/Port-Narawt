"use client";
import React, { useEffect, useState } from 'react';
import './claw-machine.css'; // นำเข้าสไตล์ของตู้คีบ

const ClawMachine: React.FC = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const targetW = 340;
      const targetH = 580;
      const scaleX = window.innerWidth / targetW;
      const scaleY = window.innerHeight / targetH;
      // Allow up to 1.5x on mobile to fill the viewport better
      const maxScale = window.innerWidth <= 768 ? 1.5 : 1;
      const newScale = Math.min(scaleX, scaleY, maxScale);
      setScale(newScale);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let active = true;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    const activeIntervals = new Set<ReturnType<typeof setInterval>>();

    const cleanupGame = () => {
      // Clear all intervals
      activeIntervals.forEach(clearInterval);
      activeIntervals.clear();

      // Stop retry timer
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }

      // Remove dynamically added toy elements to prevent duplication in StrictMode
      const box = document.querySelector('.box');
      if (box) {
        box.querySelectorAll('.toy').forEach((el) => el.remove());
      }
      const collectionBox = document.querySelector('.collection-box');
      if (collectionBox) {
        collectionBox.innerHTML = '';
      }
      
      // Reset classes and styles on static elements
      const clawMachine = document.querySelector('.claw-machine');
      if (clawMachine) {
        clawMachine.classList.remove('show-overlay');
      }
      const collectionArrow = document.querySelector('.collection-arrow');
      if (collectionArrow) {
        collectionArrow.classList.remove('active');
      }
      const arm = document.querySelector('.arm') as HTMLElement;
      if (arm) {
        arm.classList.remove('open', 'missed');
        arm.style.height = '';
      }
      const vertRail = document.querySelector('.vert') as HTMLElement;
      if (vertRail) {
        vertRail.style.left = '';
      }
      const armJoint = document.querySelector('.arm-joint') as HTMLElement;
      if (armJoint) {
        armJoint.style.top = '';
        armJoint.style.left = '';
      }
    };

    const tryInit = () => {
      if (!active) return;

      const clawMachine = document.querySelector('.claw-machine') as HTMLElement;
      const box = document.querySelector('.box') as HTMLElement;
      const machineTopEl = document.querySelector('.machine-top') as HTMLElement;
      const machineBottomEl = document.querySelector('.machine-bottom') as HTMLElement;
      const collectionBox = document.querySelector('.collection-box') as HTMLElement;
      const collectionArrow = document.querySelector('.collection-arrow') as HTMLElement;

      if (!clawMachine || !box || !machineTopEl || !machineBottomEl || !collectionBox || !collectionArrow) {
        timerId = setTimeout(tryInit, 50);
        return;
      }

      const rect = clawMachine.getBoundingClientRect();
      const topRect = machineTopEl.getBoundingClientRect();
      const bottomRect = machineBottomEl.getBoundingClientRect();

      // Ensure that CSS has loaded and elements have non-zero dimensions
      if (rect.width === 0 || rect.height === 0 || topRect.height === 0 || bottomRect.height === 0) {
        timerId = setTimeout(tryInit, 50);
        return;
      }

      // Run cleanup first to make sure there are no leftovers
      cleanupGame();

      // ========== กำหนด Interfaces และ Types ==========
      interface Elements {
        clawMachine: HTMLElement;
        box: HTMLElement;
        collectionBox: HTMLElement;
        collectionArrow: HTMLElement;
        toys: Toy[];
      }

      interface Settings {
        targetToy: Toy | null;
        collectedNumber: number;
      }

      interface ToySize {
        w: number;
        h: number;
      }

      interface ToySizes {
        [key: string]: ToySize;
      }

      interface Position {
        x: number;
        y: number;
      }

      interface ButtonProps {
        className: string;
        action?: (e: Event) => void;
        isLocked: boolean;
        pressAction: (e: Event) => void;
        releaseAction: (e: Event) => void;
      }

      interface WorldObjectProps {
        className?: string;
        x?: number;
        y?: number;
        z?: number;
        bottom?: string;
        moveWith?: (WorldObject | Toy | null)[];
        index?: number;
      }

      interface MoveProps {
        moveKey: 'x' | 'y' | 'h' | 'w';
        target?: number;
        moveTime?: number;
        next?: () => void;
      }

      // ========== ตัวแปรสำหรับเก็บ element ต่างๆ ==========
      const elements: Elements = {
        clawMachine,
        box,
        collectionBox,
        collectionArrow,
        toys: [],
      };

      // ========== การตั้งค่าเกม ==========
      const settings: Settings = {
        targetToy: null,
        collectedNumber: 0,
      };

      const m: number = 2;

      const toys: ToySizes = {
        bear: { w: 20 * m, h: 27 * m },
        bunny: { w: 20 * m, h: 29 * m },
        golem: { w: 20 * m, h: 27 * m },
        cucumber: { w: 16 * m, h: 28 * m },
        penguin: { w: 24 * m, h: 22 * m },
        robot: { w: 20 * m, h: 30 * m },
      };

      const sortedToys: string[] = [...Object.keys(toys), ...Object.keys(toys)].sort(
        () => 0.5 - Math.random(),
      );

      const cornerBuffer: number = 16;
      const machineBuffer: Position = { x: 36, y: 16 };

      const radToDeg = (rad: number): number => Math.round(rad * (180 / Math.PI));
      const calcX = (i: number, n: number): number => i % n;
      const calcY = (i: number, n: number): number => Math.floor(i / n);

      // คำนวณขนาดจากขนาดจริงบนหน้าจอ
      const machineWidth = rect.width;
      const machineHeight = rect.height;
      const machineTop = rect.top;
      const machineTopHeight = topRect.height;
      const machineBottomHeight = bottomRect.height;
      const machineBottomTop = bottomRect.top;

      const maxArmLength: number = machineBottomTop - machineTop - machineBuffer.y;

      const adjustAngle = (angle: number): number => {
        const adjustedAngle = angle % 360;
        return adjustedAngle < 0 ? adjustedAngle + 360 : adjustedAngle;
      };

      const randomN = (min: number, max: number): number => {
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
      };

      // ========== คลาสปุ่มกด ==========
      class Button {
        el: HTMLElement;
        isLocked: boolean;

        constructor({ className, action, isLocked, pressAction, releaseAction }: ButtonProps) {
          this.el = document.querySelector(`.${className}`) as HTMLElement;
          this.isLocked = isLocked;

          if (action) this.el.addEventListener('click', action);

          ;(['mousedown', 'touchstart'] as const).forEach((evt) =>
            this.el.addEventListener(evt, pressAction),
          );

          ;(['mouseup', 'touchend'] as const).forEach((evt) =>
            this.el.addEventListener(evt, releaseAction),
          );

          if (!isLocked) this.activate();
        }

        activate(): void {
          this.isLocked = false;
          this.el.classList.add('active');
        }

        deactivate(): void {
          this.isLocked = true;
          this.el.classList.remove('active');
        }
      }

      // ========== คลาสวัตถุในโลก ==========
      class WorldObject {
        x: number = 0;
        y: number = 0;
        z: number = 0;
        w: number = 0;
        h: number = 0;
        angle: number = 0;
        bottom?: string;
        transformOrigin: string | { x: number; y: number } = { x: 0, y: 0 };
        interval: ReturnType<typeof setInterval> | null = null;
        default: { [key: string]: number } = {};
        moveWith: (WorldObject | Toy | null)[] = [];
        el: HTMLElement;
        clawPos?: Position;

        constructor(props: WorldObjectProps) {
          this.el = (props.className ? document.querySelector(`.${props.className}`) : null) as HTMLElement;
          
          Object.assign(this, props);
          this.setStyles();

          if (props.className && this.el) {
            const { width, height } = this.el.getBoundingClientRect();
            this.w = width;
            this.h = height;
          }

          ;(['x', 'y', 'w', 'h'] as const).forEach((key) => {
            this.default[key] = this[key as keyof WorldObject] as number;
          });
        }

        setStyles(): void {
          if (!this.el) return;
          Object.assign(this.el.style, {
            left: `${this.x}px`,
            top: !this.bottom ? `${this.y}px` : '',
            bottom: this.bottom || '',
            width: `${this.w}px`,
            height: `${this.h}px`,
            transformOrigin: typeof this.transformOrigin === 'string' 
              ? this.transformOrigin 
              : `${this.transformOrigin.x}px ${this.transformOrigin.y}px`,
          });
          this.el.style.zIndex = this.z.toString();
        }

        setClawPos(clawPos: Position): void {
          this.clawPos = clawPos;
        }

        setTransformOrigin(transformOrigin: 'center' | Position): void {
          this.transformOrigin = transformOrigin;
          this.setStyles();
        }

        handleNext(next?: () => void): void {
          if (this.interval) {
            clearInterval(this.interval);
            activeIntervals.delete(this.interval);
            this.interval = null;
          }
          if (next) next();
        }

        resumeMove({ moveKey, target, moveTime, next }: MoveProps): void {
          this.interval = null;
          this.move({ moveKey, target, moveTime, next });
        }

        resizeShadow(): void {
          elements.box.style.setProperty('--scale', (0.5 + this.h / maxArmLength / 2).toString());
        }

        move({ moveKey, target, moveTime, next }: MoveProps): void {
          if (this.interval) {
            this.handleNext(next);
          } else {
            const moveTarget = target !== undefined ? target : this.default[moveKey];
            this.interval = setInterval(() => {
              const distance = Math.abs(this[moveKey] - moveTarget) < 10
                ? Math.abs(this[moveKey] - moveTarget)
                : 10;
              const increment = this[moveKey] > moveTarget ? -distance : distance;

              if (increment > 0 ? this[moveKey] < moveTarget : this[moveKey] > moveTarget) {
                this[moveKey] += increment;
                this.setStyles();

                if (moveKey === 'h') this.resizeShadow();

                if (this.moveWith.length) {
                  this.moveWith.forEach((obj) => {
                    if (!obj) return;
                    const keyToMove = moveKey === 'h' ? 'y' : moveKey;
                    obj[keyToMove] += increment;
                    obj.setStyles();
                  });
                }
              } else {
                this.handleNext(next);
              }
            }, moveTime || 100);
            if (this.interval) activeIntervals.add(this.interval);
          }
        }
      }

      // ========== คลาสตุ๊กตา ==========
      class Toy extends WorldObject {
        index: number;
        toyType: string;

        constructor(props: WorldObjectProps & { index: number }) {
          const toyType = sortedToys[props.index];
          const size = toys[toyType];
          
          const createdEl = document.createElement('div');
          createdEl.className = `toy pix ${toyType}`;

          const computedX = cornerBuffer +
            calcX(props.index, 4) * ((machineWidth - cornerBuffer * 3) / 4) +
            size.w / 2 +
            randomN(-6, 6);

          const computedY = machineBottomTop -
            machineTop +
            cornerBuffer +
            calcY(props.index, 4) * ((machineBottomHeight - cornerBuffer * 2) / 3) -
            size.h / 2 +
            randomN(-2, 2);

          super({
            x: computedX,
            y: computedY,
            z: 0,
            ...props,
          });

          this.el = createdEl;
          this.index = props.index;
          this.toyType = toyType;
          this.w = size.w;
          this.h = size.h;

          ;(['x', 'y', 'w', 'h'] as const).forEach((key) => {
            this.default[key] = this[key as keyof Toy] as number;
          });

          this.setStyles();
          elements.box.append(this.el);

          this.el.addEventListener('click', () => this.collectToy(this));
          elements.toys.push(this);
        }

        collectToy(toy: Toy): void {
          toy.el.classList.remove('selected');
          toy.x = machineWidth / 2 - toy.w / 2;
          toy.y = machineHeight / 2 - toy.h / 2;
          toy.z = 7;
          toy.el.style.setProperty('--rotate-angle', '0deg');
          toy.setTransformOrigin('center');
          toy.el.classList.add('display');
          
          elements.clawMachine.classList.add('show-overlay');
          settings.collectedNumber++;
          
          const wrapper = document.createElement('div');
          wrapper.className = `toy-wrapper ${settings.collectedNumber > 6 ? 'squeeze-in' : ''}`;
          wrapper.innerHTML = `<div class="toy pix ${toy.toyType}"></div>`;
          elements.collectionBox.appendChild(wrapper);
          
          setTimeout(() => {
            elements.clawMachine.classList.remove('show-overlay');
            if (!document.querySelector('.selected'))
              elements.collectionArrow.classList.remove('active');
          }, 1000);
        }

        setRotateAngle(): void {
          if (!this.clawPos) return;
          const angle = radToDeg(
            Math.atan2(
              this.y + this.h / 2 - this.clawPos.y,
              this.x + this.w / 2 - this.clawPos.x,
            ),
          ) - 90;
          const adjustedAngle = Math.round(adjustAngle(angle));
          this.angle = adjustedAngle < 180 ? adjustedAngle * -1 : 360 - adjustedAngle;
          this.el.style.setProperty('--rotate-angle', `${this.angle}deg`);
        }
      }

      // ========== เริ่มต้นระบบตู้คีบ ==========
      elements.box.style.setProperty('--shadow-pos', `${maxArmLength}px`);

      const armJoint = new WorldObject({ className: 'arm-joint' });
      const vertRail = new WorldObject({ className: 'vert', moveWith: [null, armJoint] });
      const arm = new WorldObject({ className: 'arm' });

      armJoint.resizeShadow();

      armJoint.move({
        moveKey: 'y',
        target: machineTopHeight - machineBuffer.y,
        moveTime: 50,
        next: () =>
          vertRail.resumeMove({
            moveKey: 'x',
            target: machineBuffer.x,
            moveTime: 50,
            next: () => {
              Object.assign(armJoint.default, {
                y: machineTopHeight - machineBuffer.y,
                x: machineBuffer.x,
              });
              Object.assign(vertRail.default, { x: machineBuffer.x });
              activateHoriBtn();
            },
          }),
      });

      const doOverlap = (a: Toy, b: { x: number; y: number; w: number; h: number }): boolean => {
        return b.x > a.x && b.x < a.x + a.w && b.y > a.y && b.y < a.y + a.h;
      };

      const getClosestToy = (): void => {
        const claw = {
          y: armJoint.y + maxArmLength + machineBuffer.y + 7,
          x: armJoint.x + 7,
          w: 40,
          h: 32,
        };
        
        const overlappedToys = elements.toys.filter((t) => doOverlap(t, claw));

        if (overlappedToys.length) {
          const toy = overlappedToys.sort((a, b) => b.index - a.index)[0];
          toy.setTransformOrigin({ x: claw.x - toy.x, y: claw.y - toy.y });
          toy.setClawPos({ x: claw.x, y: claw.y });
          settings.targetToy = toy;
        }
      };

      new Array(12).fill('').forEach((_, i) => {
        if (i === 8) return;
        new Toy({ index: i });
      });

      const stopHoriBtnAndActivateVertBtn = (): void => {
        armJoint.interval = null;
        horiBtn.deactivate();
        vertBtn.activate();
      };

      const activateHoriBtn = (): void => {
        horiBtn.activate();
        ;[vertRail, armJoint, arm].forEach((c) => {
          if (c.interval) {
            clearInterval(c.interval);
            activeIntervals.delete(c.interval);
            c.interval = null;
          }
        });
      };

      const dropToy = (): void => {
        arm.el.classList.add('open');
        
        if (settings.targetToy) {
          settings.targetToy.z = 3;
          settings.targetToy.move({
            moveKey: 'y',
            target: machineHeight - settings.targetToy.h - 30,
            moveTime: 50,
          });
          ;[vertRail, armJoint, arm].forEach((obj) => { if (obj) obj.moveWith[0] = null; });
        }
        
        setTimeout(() => {
          arm.el.classList.remove('open');
          activateHoriBtn();
          
          if (settings.targetToy) {
            settings.targetToy.el.classList.add('selected');
            elements.collectionArrow.classList.add('active');
            settings.targetToy = null;
          }
        }, 700);
      };

      const grabToy = (): void => {
        if (settings.targetToy) {
          ;[vertRail, armJoint, arm].forEach((obj) => {
            if (obj) obj.moveWith[0] = settings.targetToy;
          });
          settings.targetToy.setRotateAngle();
          settings.targetToy.el.classList.add('grabbed');
        } else {
          arm.el.classList.add('missed');
        }
      };

      const horiBtn = new Button({
        className: 'hori-btn',
        isLocked: true,
        pressAction: () => {
          arm.el.classList.remove('missed');
          vertRail.move({
            moveKey: 'x',
            target: machineWidth - armJoint.w - machineBuffer.x,
            next: stopHoriBtnAndActivateVertBtn,
          });
        },
        releaseAction: () => {
          if (vertRail.interval) {
            clearInterval(vertRail.interval);
            activeIntervals.delete(vertRail.interval);
          }
          stopHoriBtnAndActivateVertBtn();
        },
      });

      const vertBtn = new Button({
        className: 'vert-btn',
        isLocked: true,
        pressAction: () => {
          if (vertBtn.isLocked) return;
          armJoint.move({
            moveKey: 'y',
            target: machineBuffer.y,
          });
        },
        releaseAction: () => {
          if (armJoint.interval) {
            clearInterval(armJoint.interval);
            activeIntervals.delete(armJoint.interval);
          }
          vertBtn.deactivate();
          getClosestToy();
          
          setTimeout(() => {
            arm.el.classList.add('open');
            arm.move({
              moveKey: 'h',
              target: maxArmLength,
              next: () =>
                setTimeout(() => {
                  arm.el.classList.remove('open');
                  grabToy();
                  arm.resumeMove({
                    moveKey: 'h',
                    next: () => {
                      vertRail.resumeMove({
                        moveKey: 'x',
                        next: () => {
                          armJoint.resumeMove({
                            moveKey: 'y',
                            next: dropToy,
                          });
                        },
                      });
                    },
                  });
                }, 500),
            });
          }, 500);
        },
      });
    };

    timerId = setTimeout(tryInit, 50);

    return () => {
      active = false;
      cleanupGame();
    };
  }, []);

  return (
    <div className="claw-machine-body-wrapper">
      <div className="wrapper" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <div className="collection-box pix"></div>
        <div className="claw-machine">
          <div className="box pix">
            <div className="machine-top pix">
              <div className="arm-joint pix">
                <div className="arm pix">
                  <div className="claws pix"></div>
                </div>
              </div>
              <div className="rail hori pix"></div>
              <div className="rail vert pix"></div>
            </div>
            <div className="machine-bottom pix">
              <div className="collection-point pix"></div>
            </div>
          </div>
          <div className="control pix">
            <div className="cover left"></div>
            <button className="hori-btn pix" aria-label="Horizontal Move"></button>
            <button className="vert-btn pix" aria-label="Vertical Move"></button>
            <div className="cover right">
              <div className="instruction pix"></div>
            </div>
            <div className="cover bottom"></div>
            <div className="cover top">
              <div className="collection-arrow pix"></div>
            </div>
            <div className="collection-point pix"></div>
          </div>
        </div>
      </div>
      <div className="mobile-instruction">
        <strong>🎮 วิธีเล่น / How to Play</strong>
        กดค้างปุ่มลูกศร ◀▶ เพื่อเลื่อนแขนคีบ แล้วกดปุ่ม ▲▼ เพื่อหย่อนลง<br/>
        Hold arrow buttons to move the claw, then press to drop!
      </div>
      <div className="sign">
        <a href="https://github.com/Narawit-Intusub" target="_blank" rel="noopener noreferrer">
          GitHub-Narwit
        </a>
      </div>
    </div>
  );
};

export default ClawMachine;