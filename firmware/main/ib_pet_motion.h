#pragma once
typedef struct {float tilt,x,y,squash;} ib_pet_targets_t;
typedef struct {float value,velocity,target,omega,zeta;} ib_pet_spring_t;
ib_pet_targets_t ib_pet_motion(const char *state,float t,float clock);
float ib_pet_step_spring(ib_pet_spring_t *spring,float dt);
