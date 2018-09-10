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
      opacity: '1'
    })),
    transition('void => *', [
      style({
        opacity: '0'
      }),
      animate(100)
    ]),
    transition('* => void', [
      animate(100, style({
        opacity: '0'
      }))
    ])
  ])
];
