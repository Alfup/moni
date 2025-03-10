#version 300 es

precision highp float;
precision mediump int;
precision mediump sampler2D;

in vec2 uv;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uPlanetPosition;
uniform float uPlanetRadius;
uniform float uRotationOffset;
uniform float uBumpStrength;
uniform sampler2D uPlanetColor;
uniform sampler2D uStars;
uniform vec3 uCameraPosition;
uniform mat3 uCameraView;
uniform vec3 uAtmosphereColor;
uniform float uAtmosphereDensity;
uniform float uSunIntensity;
uniform float uAmbientLight;
in vec3 uSunDirection;

#define ROTATION_SPEED -0.2
#define PLANET_ROTATION rotateY(uTime * ROTATION_SPEED + uRotationOffset)
#define SUN_COLOR vec3(1.0, 1.0, 1.0)
#define DEEP_SPACE vec3(0., 0., 0.0005)
#define INFINITY 1e10
#define CAMERA_POSITION uCameraPosition
#define FOCAL_LENGTH CAMERA_POSITION.z / (CAMERA_POSITION.z - uPlanetPosition.z)
#define PI acos(-1.)

struct Material {
  vec3 color;
  float diffuse;
  float specular;
  vec3 emission;
};

struct Hit {
  float len;
  vec3 normal;
  Material material;
};

struct Sphere {
  vec3 position;
  float radius;
};

Sphere getPlanet() {
  return Sphere(uPlanetPosition, uPlanetRadius);
}

Hit miss = Hit(INFINITY, vec3(0.), Material(vec3(0.), -1., -1., vec3(-1.)));

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

vec2 sphereProjection(vec3 p, vec3 origin) {
  vec3 dir = normalize(p - origin);
  float longitude = atan(dir.x, dir.z);
  float latitude = asin(dir.y);
  return vec2((longitude + PI) / (2. * PI), (latitude + PI / 2.) / PI);
}

float sphIntersect(in vec3 ro, in vec3 rd, in Sphere sphere) {
  vec3 oc = ro - sphere.position;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - sphere.radius * sphere.radius;
  float h = b * b - c;
  if(h < 0.0) return -1.;
  return -b - sqrt(h);
}

mat3 rotateY(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(vec3(c, 0, s), vec3(0, 1, 0), vec3(-s, 0, c));
}

vec3 simpleReinhardToneMapping(vec3 color) {
  float exposure = 1.5;
  color *= exposure / (1. + color / exposure);
  color = pow(color, vec3(1. / 2.4));
  return color;
}

float Sigmoid(float x) {
  return 1.0 / (1.0 + (exp(-(x - 0.7) * 6.5))); 
}

vec3 Scurve(vec3 color) {
  return vec3(Sigmoid(color.x), Sigmoid(color.y), Sigmoid(color.z));
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 generateStars(vec2 uv, float density) {
    vec2 coord = floor(uv * 700.0);
    float rand = hash12(coord);
    vec3 stars = vec3(0.0);
    
    if (rand < density) {
        vec2 pointCoord = fract(uv * 700.0) - 0.5;
        float dist = length(pointCoord);
        float brightness = smoothstep(0.15, 0.0, dist);
        float twinkle = sin(uTime * 2.0 + rand * 6.28) * 0.5 + 0.5;
        brightness *= mix(0.8, 1.2, twinkle);
        
        vec3 starColor = mix(
            vec3(1.0, 1.0, 1.2),
            vec3(1.0, 0.9, 0.7),
            hash12(coord + 1.0)
        );
        
        float glow = smoothstep(0.5, 0.0, dist);
        vec3 glowColor = mix(
            vec3(0.5, 0.7, 1.0),
            vec3(1.0, 0.8, 0.5),
            hash12(coord + 2.0)
        );
        
        stars = brightness * starColor * 0.3 + glow * glowColor * 0.1;
    }
    return stars;
}

float planetNoise(vec3 p) {
  vec2 textureCoord = sphereProjection(p, uPlanetPosition);
  float bump = length(texture(uPlanetColor, textureCoord));
  return uBumpStrength * bump;
}

float planetDist(in vec3 ro, in vec3 rd) {
  float smoothSphereDist = sphIntersect(ro, rd, getPlanet());
  vec3 intersection = ro + smoothSphereDist * rd;
  vec3 intersectionWithRotation = PLANET_ROTATION * (intersection - uPlanetPosition) + uPlanetPosition;
  return sphIntersect(ro, rd, Sphere(uPlanetPosition, uPlanetRadius + planetNoise(intersectionWithRotation)));
}

vec3 planetNormal(vec3 p) {
  vec3 rd = uPlanetPosition - p;
  float dist = planetDist(p, rd);
  vec2 e = vec2(max(.01, .03 * smoothstep(1300., 300., uResolution.x)), 0);
  vec3 normal = dist - vec3(planetDist(p - e.xyy, rd), planetDist(p - e.yxy, rd), planetDist(p + e.yyx, rd));
  return normalize(normal);
}

vec3 spaceColor(vec3 direction) {
  vec3 backgroundCoord = direction * rotateY(uTime * ROTATION_SPEED / 20. + 1.5);
  vec2 starUV = sphereProjection(backgroundCoord, vec3(0.));
  
  vec3 stars = vec3(0.0);
  stars += generateStars(starUV * 2.0, 0.0004) * 1.0;
  stars += generateStars(starUV * 4.0, 0.0003) * 0.8;
  stars += generateStars(starUV * 8.0, 0.0002) * 0.6;

  return DEEP_SPACE + stars;
}

vec3 atmosphereColor(vec3 ro, vec3 rd, float spaceMask) {
  float distCameraToPlanetOrigin = length(uPlanetPosition - CAMERA_POSITION);
  float distCameraToPlanetEdge = sqrt(distCameraToPlanetOrigin * distCameraToPlanetOrigin - uPlanetRadius * uPlanetRadius);
  float planetMask = 1.0 - spaceMask;
  vec3 coordFromCenter = (ro + rd * distCameraToPlanetEdge) - uPlanetPosition;
  float distFromEdge = abs(length(coordFromCenter) - uPlanetRadius);
  float planetEdge = max(uPlanetRadius - distFromEdge, 0.) / uPlanetRadius;
  float atmosphereMask = pow(remap(dot(uSunDirection, coordFromCenter), -uPlanetRadius, uPlanetRadius / 2., 0., 1.), 5.);
  atmosphereMask *= uAtmosphereDensity * uPlanetRadius * uSunIntensity;

  vec3 atmosphere = vec3(pow(planetEdge, 120.)) * .5;
  atmosphere += pow(planetEdge, 50.) * .3 * (1.5 - planetMask);
  atmosphere += pow(planetEdge, 15.) * .015;
  atmosphere += pow(planetEdge, 5.) * .04 * planetMask;
  
  return atmosphere * uAtmosphereColor * atmosphereMask;
}

Hit intersectPlanet(vec3 ro, vec3 rd) {
  float len = sphIntersect(ro, rd, getPlanet());

  if(len < 0.) return miss;

  vec3 position = ro + len * rd;
  vec3 rotatedPosition = PLANET_ROTATION * (position - uPlanetPosition) + uPlanetPosition;
  vec2 textureCoord = sphereProjection(rotatedPosition, uPlanetPosition);
  vec3 color = texture(uPlanetColor, textureCoord).rgb;
  color = Scurve(color);
  vec3 normal = planetNormal(position);

  return Hit(len, normal, Material(color, 1., 0., vec3(0.)));
}

Hit intersectScene(vec3 ro, vec3 rd) {
  return intersectPlanet(ro, rd);
}

vec3 radiance(vec3 ro, vec3 rd) {
  vec3 color = vec3(0.);
  float spaceMask = 1.;
  Hit hit = intersectScene(ro, rd);

  if(hit.len < INFINITY) {
    spaceMask = 0.;
    float directLightIntensity = pow(clamp(dot(hit.normal, uSunDirection), 0.0, 1.0), 2.) * uSunIntensity;
    vec3 diffuseLight = directLightIntensity * SUN_COLOR;
    vec3 diffuseColor = hit.material.color.rgb * (uAmbientLight + diffuseLight);
    vec3 reflected = normalize(reflect(-uSunDirection, hit.normal));
    float phongValue = pow(max(0.0, dot(rd, reflected)), 10.) * .2 * uSunIntensity;
    vec3 specularColor = hit.material.specular * vec3(phongValue);
    color = diffuseColor + specularColor + hit.material.emission;
  } else {
    float zoomFactor = min(uResolution.x / uResolution.y, 1.);
    vec3 backgroundRd = normalize(vec3(uv * zoomFactor, -1.));
    color = spaceColor(backgroundRd);
  }

  return color + atmosphereColor(ro, rd, spaceMask);
}

void main() {
  vec3 ro = vec3(CAMERA_POSITION);
  vec3 rd = uCameraView * normalize(vec3(uv * FOCAL_LENGTH, -1.));
  vec3 color = radiance(ro, rd);
  color = simpleReinhardToneMapping(color);
  color *= 1. - 0.5 * pow(length(uv), 3.);
  fragColor = vec4(color, 1.0);
}