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
uniform float u_style;
uniform float u_sat;
uniform float u_mode;
uniform float u_size;
uniform sampler2D u_video;
  
#define R u_resolution
#define T u_time

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
    if(u_style==1.){
        if (gray > 0.185) n = 65792;  
        if (gray > 0.225) n = 102168;
        if (gray > 0.325) n = 18157905; 
        if (gray > 0.455) n = 22369621;
        if (gray > 0.525) n = 22511061;
        if (gray > 0.675) n = 33412991;
        if (gray > 0.725) n = 33222335;
        if (gray > 0.825) n = 33550335;
        if (gray > 0.925) n = 33554431;
    }else if(u_style==2.){
        if (gray > 0.1) n = 4096;
        if (gray > 0.3) n = 342144;
        if (gray > 0.4) n = 359876;
        if (gray > 0.5) n = 11533764;
        if (gray > 0.6) n = 33212287;
        if (gray > 0.7) n = 29360110;
        if (gray > 0.9) n = 33544063;
    }else if(u_style==3.){
        if (gray > 0.05) n = 4;
        if (gray > 0.15) n = 69905;
        if (gray > 0.25) n = 992;
        if (gray > 0.35) n = 1050625;
        if (gray > 0.45) n = 33488896;
        if (gray > 0.55) n = 16843009;
        if (gray > 0.65) n = 164836;
        if (gray > 0.75) n = 2236962;
        if (gray > 0.85) n = 2113665;
        if (gray > 0.95) n = 1118481; 
    }else{
        if (gray > 0.0233) n = 128;     // .
        if (gray > 0.0465) n = 131200;   // :
        if (gray > 0.0698) n = 4329476;  // !
        if (gray > 0.0930) n = 459200;   // =
        if (gray > 0.1163) n = 4591748;  // 1
        if (gray > 0.1395) n = 12652620; // 3
        if (gray > 0.1628) n = 14749828; // 7
        if (gray > 0.1860) n = 18393220; // y
        if (gray > 0.2093) n = 15239300; // ?
        if (gray > 0.2326) n = 17318431; // l
        if (gray > 0.2558) n = 32641156; // t
        if (gray > 0.2791) n = 18393412; // v
        if (gray > 0.3023) n = 18157905; // x
        if (gray > 0.3256) n = 17463428; // 4
        if (gray > 0.3488) n = 14954572; // 5
        if (gray > 0.3721) n = 13177118; // 2
        if (gray > 0.3953) n = 18405034; // w
        if (gray > 0.4186) n = 16269839; // c
        if (gray > 0.4419) n = 15018318; // 0 
        if (gray > 0.4651) n = 18400814; // u
        if (gray > 0.4884) n = 33081316; // q
        if (gray > 0.5116) n = 15255086; // o
        if (gray > 0.5349) n = 32045584; // p
        if (gray > 0.5581) n = 6566222;  // 6
        if (gray > 0.5814) n = 15022158; // 9
        if (gray > 0.6047) n = 18444881; // k
        if (gray > 0.6279) n = 16272942; // g
        if (gray > 0.6512) n = 18415153; // h
        if (gray > 0.6744) n = 32641183; // i
        if (gray > 0.6977) n = 32540207; // j
        if (gray > 0.7209) n = 18732593; // m
        if (gray > 0.7442) n = 18667121; // n
        if (gray > 0.7674) n = 16267326; // s
        if (gray > 0.7907) n = 32575775; // z
        if (gray > 0.8140) n = 15022414; // 8
        if (gray > 0.8372) n = 15255537; // a
        if (gray > 0.8605) n = 32032318; // d
        if (gray > 0.8837) n = 32045617; // r
        if (gray > 0.9070) n = 33061392; // f
        if (gray > 0.9302) n = 33061407; // e 
        if (gray > 0.9535) n = 32045630; // b
        if (gray > 0.9767) n = 11512810; // #
    }

    vec2 p = mod(F.xy/size, 1.) - 0.5;
    if(u_style==0.) p = mod(F.xy/size, 2.) - vec2(1);
    vec3 hue = u_mode==1.? col =mix(vec3(gray),col,u_sat): hsv(vec3(u_hue,u_sat,.65));
    col = hue*character(n, p);
    fragColor = vec4(col, 1);
}`;

export default chromaShader;
