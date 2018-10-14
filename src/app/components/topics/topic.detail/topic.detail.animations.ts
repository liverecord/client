import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

export default [
  trigger('flyInOut', [
    state('in', style({
      opacity: '1',
      width: '3vh',
      height: '3vh'
    })),
    transition('void => *', [
      style({
        opacity: '0',
        width: '0vh',
        height: '0vh'
      }),
      animate(100)
    ]),
    transition('* => void', [
      animate(300, style({
        opacity: '0',
        width: '0vh',
        height: '0vh'
      }))
    ])
  ])
];
