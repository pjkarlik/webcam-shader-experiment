const chromaShader = `#version 300 es
 #if __VERSION__ < 130
#define TEXTURE2D texture2D
#else
#define TEXTURE2D texture
#endif
precision highp float;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_hue;
uniform float u_sat;
uniform float u_mode;
uniform float u_size;
uniform sampler2D u_video;
  
#define R u_resolution
#define T u_time

/**
    twgl video texture setup
    make your own bitmasks here
    https://codepen.io/pjkarlik/pen/zxvPMgb
*/

vec3 hsv( in vec3 c ) {
    vec3 rgb = clamp( abs(mod(c.x*2.+vec3(0,4,2),6.)-3.)-1., 0., 1.0 );
    return c.z * mix( vec3(1), rgb, c.y);
}

float character(int n, vec2 p) {
	p = floor(p*vec2(-4., 4.) + 2.5);
    if (clamp(p.x, 0., 4.) == p.x) {
        if (clamp(p.y, 0., 4.) == p.y) {
        	int a = int(round(p.x) + 5. * round(p.y));
			    if (((n >> a) & 1) == 1) return 1.;
		    }	
    }
	return 0.;
}

void main(){ 
    vec2 F = gl_FragCoord.xy;
    vec2 uv = (2.*F.xy-R.xy)/max(R.x,R.y);
    F.y =1.- F.y;
    float size = u_size;
    float srez = size*2.;
    vec3 col = texture(u_video, floor(F.xy/srez)*srez/R.xy).rgb;
    col = pow(col,vec3(2.2));
    float gray = .3 * col.r + .6 * col.g + .1 * col.b;

    int n =  4096;
    if (gray > 0.185) n = 65792;  
    if (gray > 0.225) n = 102168;
    if (gray > 0.325) n = 18157905; 
    if (gray > 0.455) n = 22369621;
    if (gray > 0.525) n = 22511061;
    if (gray > 0.675) n = 33412991;
    if (gray > 0.725) n = 33222335;
    if (gray > 0.825) n = 33550335;
    if (gray > 0.975) n = 33554431;
  
    vec2 p = mod(F.xy/size, 1.) - 0.5;
    vec3 hue = u_mode==1.? col =mix(vec3(gray),col,u_sat): hsv(vec3(u_hue,u_sat,.65));
    col = hue*character(n, p);
    fragColor = vec4(col, 1);
}`;

export default chromaShader;
