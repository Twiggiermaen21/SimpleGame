// // EnemyFSM.js
// export default class EnemyFSM {
//   constructor(enemy) {
//     this.enemy = enemy;
//     this.state = 'patrol'; // idle, patrol, chase
//   }

//   update(deltaTime) {
//     const distance = this.enemy.model.position.distanceTo(this.enemy.target.position);
//     if (distance < 5) {
//       this.state = 'chase';
//     } else {
//       this.state = 'patrol';
//     }

//     switch (this.state) {
//       case 'patrol':
//         this.enemy.patrol(deltaTime);
//         break;
//       case 'chase':
//         this.enemy.chase(deltaTime);
//         break;
//     }
//   }
// }
