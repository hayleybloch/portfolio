"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[94],{1263:(e,t,s)=>{s.d(t,{F:()=>u});var r=s(3720),i=s(7042);let n={name:"SAOShader",defines:{NUM_SAMPLES:7,NUM_RINGS:4,DIFFUSE_TEXTURE:0,PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},tDiffuse:{value:null},tNormal:{value:null},size:{value:new r.I9Y(512,512)},cameraNear:{value:1},cameraFar:{value:100},cameraProjectionMatrix:{value:new r.kn4},cameraInverseProjectionMatrix:{value:new r.kn4},scale:{value:1},intensity:{value:.1},bias:{value:.5},minResolution:{value:0},kernelRadius:{value:100},randomSeed:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		#include <common>

		varying vec2 vUv;

		#if DIFFUSE_TEXTURE == 1
		uniform sampler2D tDiffuse;
		#endif

		uniform highp sampler2D tDepth;
		uniform highp sampler2D tNormal;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;

		uniform float scale;
		uniform float intensity;
		uniform float bias;
		uniform float kernelRadius;
		uniform float minResolution;
		uniform vec2 size;
		uniform float randomSeed;

		// RGBA depth

		#include <packing>

		vec4 getDefaultColor( const in vec2 screenPosition ) {
			#if DIFFUSE_TEXTURE == 1
			return texture2D( tDiffuse, vUv );
			#else
			return vec4( 1.0 );
			#endif
		}

		float getDepth( const in vec2 screenPosition ) {
			return texture2D( tDepth, screenPosition ).x;
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
			return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {
			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];
			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );
			clipPosition *= clipW; // unprojection.

			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;
		}

		vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {
			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );
		}

		float scaleDividedByCameraFar;
		float minResolutionMultipliedByCameraFar;

		float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {
			vec3 viewDelta = sampleViewPosition - centerViewPosition;
			float viewDistance = length( viewDelta );
			float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;

			return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );
		}

		// moving costly divides into consts
		const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
		const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

		float getAmbientOcclusion( const in vec3 centerViewPosition ) {
			// precompute some variables require in getOcclusion.
			scaleDividedByCameraFar = scale / cameraFar;
			minResolutionMultipliedByCameraFar = minResolution * cameraFar;
			vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );

			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
			float angle = rand( vUv + randomSeed ) * PI2;
			vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;
			vec2 radiusStep = radius;

			float occlusionSum = 0.0;
			float weightSum = 0.0;

			for( int i = 0; i < NUM_SAMPLES; i ++ ) {
				vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;
				radius += radiusStep;
				angle += ANGLE_STEP;

				float sampleDepth = getDepth( sampleUv );
				if( sampleDepth >= ( 1.0 - EPSILON ) ) {
					continue;
				}

				float sampleViewZ = getViewZ( sampleDepth );
				vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );
				occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );
				weightSum += 1.0;
			}

			if( weightSum == 0.0 ) discard;

			return occlusionSum * ( intensity / weightSum );
		}

		void main() {
			float centerDepth = getDepth( vUv );
			if( centerDepth >= ( 1.0 - EPSILON ) ) {
				discard;
			}

			float centerViewZ = getViewZ( centerDepth );
			vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );

			float ambientOcclusion = getAmbientOcclusion( viewPosition );

			gl_FragColor = getDefaultColor( vUv );
			gl_FragColor.xyz *=  1.0 - ambientOcclusion;
		}`},a={name:"DepthLimitedBlurShader",defines:{KERNEL_RADIUS:4,DEPTH_PACKING:1,PERSPECTIVE_CAMERA:1},uniforms:{tDiffuse:{value:null},size:{value:new r.I9Y(512,512)},sampleUvOffsets:{value:[new r.I9Y(0,0)]},sampleWeights:{value:[1]},tDepth:{value:null},cameraNear:{value:10},cameraFar:{value:1e3},depthCutoff:{value:10}},vertexShader:`

		#include <common>

		uniform vec2 size;

		varying vec2 vUv;
		varying vec2 vInvSize;

		void main() {
			vUv = uv;
			vInvSize = 1.0 / size;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		#include <common>
		#include <packing>

		uniform sampler2D tDiffuse;
		uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform float depthCutoff;

		uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];
		uniform float sampleWeights[ KERNEL_RADIUS + 1 ];

		varying vec2 vUv;
		varying vec2 vInvSize;

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
			return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}

		void main() {
			float depth = getDepth( vUv );
			if( depth >= ( 1.0 - EPSILON ) ) {
				discard;
			}

			float centerViewZ = -getViewZ( depth );
			bool rBreak = false, lBreak = false;

			float weightSum = sampleWeights[0];
			vec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;

			for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {

				float sampleWeight = sampleWeights[i];
				vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;

				vec2 sampleUv = vUv + sampleUvOffset;
				float viewZ = -getViewZ( getDepth( sampleUv ) );

				if( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;

				if( ! rBreak ) {
					diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;
					weightSum += sampleWeight;
				}

				sampleUv = vUv - sampleUvOffset;
				viewZ = -getViewZ( getDepth( sampleUv ) );

				if( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;

				if( ! lBreak ) {
					diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;
					weightSum += sampleWeight;
				}

			}

			gl_FragColor = diffuseSum / weightSum;
		}`},o={createSampleWeights:function(e,t){let s=[];for(let n=0;n<=e;n++){var r,i;s.push(Math.exp(-((r=n)*r)/((i=t)*i*2))/(Math.sqrt(2*Math.PI)*i))}return s},createSampleOffsets:function(e,t){let s=[];for(let r=0;r<=e;r++)s.push(t.clone().multiplyScalar(r));return s},configure:function(e,t,s,r){e.defines.KERNEL_RADIUS=t,e.uniforms.sampleUvOffsets.value=o.createSampleOffsets(t,r),e.uniforms.sampleWeights.value=o.createSampleWeights(t,s),e.needsUpdate=!0}};var l=s(5864);class u extends i.o{constructor(e,t,s=new r.I9Y(256,256)){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this._originalClearColor=new r.Q1f,this._oldClearColor=new r.Q1f,this._oldClearAlpha=1,this.params={output:0,saoBias:.5,saoIntensity:.18,saoScale:1,saoKernelRadius:100,saoMinResolution:0,saoBlur:!0,saoBlurRadius:8,saoBlurStdDev:4,saoBlurDepthCutoff:.01},this.resolution=new r.I9Y(s.x,s.y),this.saoRenderTarget=new r.nWS(this.resolution.x,this.resolution.y,{type:r.ix0}),this.blurIntermediateRenderTarget=this.saoRenderTarget.clone();let o=new r.VCu;o.format=r.dcC,o.type=r.V3x,this.normalRenderTarget=new r.nWS(this.resolution.x,this.resolution.y,{minFilter:r.hxR,magFilter:r.hxR,type:r.ix0,depthTexture:o}),this.normalMaterial=new r.qBx,this.normalMaterial.blending=r.XIg,this.saoMaterial=new r.BKk({defines:Object.assign({},n.defines),fragmentShader:n.fragmentShader,vertexShader:n.vertexShader,uniforms:r.LlO.clone(n.uniforms)}),this.saoMaterial.defines.PERSPECTIVE_CAMERA=+!!this.camera.isPerspectiveCamera,this.saoMaterial.uniforms.tDepth.value=o,this.saoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.saoMaterial.uniforms.size.value.set(this.resolution.x,this.resolution.y),this.saoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.saoMaterial.uniforms.cameraProjectionMatrix.value=this.camera.projectionMatrix,this.saoMaterial.blending=r.XIg,this.vBlurMaterial=new r.BKk({uniforms:r.LlO.clone(a.uniforms),defines:Object.assign({},a.defines),vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.vBlurMaterial.defines.DEPTH_PACKING=0,this.vBlurMaterial.defines.PERSPECTIVE_CAMERA=+!!this.camera.isPerspectiveCamera,this.vBlurMaterial.uniforms.tDiffuse.value=this.saoRenderTarget.texture,this.vBlurMaterial.uniforms.tDepth.value=o,this.vBlurMaterial.uniforms.size.value.set(this.resolution.x,this.resolution.y),this.vBlurMaterial.blending=r.XIg,this.hBlurMaterial=new r.BKk({uniforms:r.LlO.clone(a.uniforms),defines:Object.assign({},a.defines),vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.hBlurMaterial.defines.DEPTH_PACKING=0,this.hBlurMaterial.defines.PERSPECTIVE_CAMERA=+!!this.camera.isPerspectiveCamera,this.hBlurMaterial.uniforms.tDiffuse.value=this.blurIntermediateRenderTarget.texture,this.hBlurMaterial.uniforms.tDepth.value=o,this.hBlurMaterial.uniforms.size.value.set(this.resolution.x,this.resolution.y),this.hBlurMaterial.blending=r.XIg,this.materialCopy=new r.BKk({uniforms:r.LlO.clone(l.Z.uniforms),vertexShader:l.Z.vertexShader,fragmentShader:l.Z.fragmentShader,blending:r.XIg}),this.materialCopy.transparent=!0,this.materialCopy.depthTest=!1,this.materialCopy.depthWrite=!1,this.materialCopy.blending=r.bCz,this.materialCopy.blendSrc=r.wn6,this.materialCopy.blendDst=r.ojh,this.materialCopy.blendEquation=r.gO9,this.materialCopy.blendSrcAlpha=r.hdd,this.materialCopy.blendDstAlpha=r.ojh,this.materialCopy.blendEquationAlpha=r.gO9,this.fsQuad=new i.F(null)}render(e,t,s){this.renderToScreen&&(this.materialCopy.blending=r.XIg,this.materialCopy.uniforms.tDiffuse.value=s.texture,this.materialCopy.needsUpdate=!0,this._renderPass(e,this.materialCopy,null)),e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let i=e.autoClear;e.autoClear=!1,this.saoMaterial.uniforms.bias.value=this.params.saoBias,this.saoMaterial.uniforms.intensity.value=this.params.saoIntensity,this.saoMaterial.uniforms.scale.value=this.params.saoScale,this.saoMaterial.uniforms.kernelRadius.value=this.params.saoKernelRadius,this.saoMaterial.uniforms.minResolution.value=this.params.saoMinResolution,this.saoMaterial.uniforms.cameraNear.value=this.camera.near,this.saoMaterial.uniforms.cameraFar.value=this.camera.far;let n=this.params.saoBlurDepthCutoff*(this.camera.far-this.camera.near);this.vBlurMaterial.uniforms.depthCutoff.value=n,this.hBlurMaterial.uniforms.depthCutoff.value=n,this.vBlurMaterial.uniforms.cameraNear.value=this.camera.near,this.vBlurMaterial.uniforms.cameraFar.value=this.camera.far,this.hBlurMaterial.uniforms.cameraNear.value=this.camera.near,this.hBlurMaterial.uniforms.cameraFar.value=this.camera.far,this.params.saoBlurRadius=Math.floor(this.params.saoBlurRadius),(this.prevStdDev!==this.params.saoBlurStdDev||this.prevNumSamples!==this.params.saoBlurRadius)&&(o.configure(this.vBlurMaterial,this.params.saoBlurRadius,this.params.saoBlurStdDev,new r.I9Y(0,1)),o.configure(this.hBlurMaterial,this.params.saoBlurRadius,this.params.saoBlurStdDev,new r.I9Y(1,0)),this.prevStdDev=this.params.saoBlurStdDev,this.prevNumSamples=this.params.saoBlurRadius),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._renderPass(e,this.saoMaterial,this.saoRenderTarget,0xffffff,1),this.params.saoBlur&&(this._renderPass(e,this.vBlurMaterial,this.blurIntermediateRenderTarget,0xffffff,1),this._renderPass(e,this.hBlurMaterial,this.saoRenderTarget,0xffffff,1));let a=this.materialCopy;this.params.output===u.OUTPUT.Normal?this.materialCopy.uniforms.tDiffuse.value=this.normalRenderTarget.texture:this.materialCopy.uniforms.tDiffuse.value=this.saoRenderTarget.texture,this.materialCopy.needsUpdate=!0,this.params.output===u.OUTPUT.Default?a.blending=r.bCz:a.blending=r.XIg,this._renderPass(e,a,this.renderToScreen?null:s),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=i}setSize(e,t){this.saoRenderTarget.setSize(e,t),this.blurIntermediateRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.saoMaterial.uniforms.size.value.set(e,t),this.saoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.saoMaterial.uniforms.cameraProjectionMatrix.value=this.camera.projectionMatrix,this.saoMaterial.needsUpdate=!0,this.vBlurMaterial.uniforms.size.value.set(e,t),this.vBlurMaterial.needsUpdate=!0,this.hBlurMaterial.uniforms.size.value.set(e,t),this.hBlurMaterial.needsUpdate=!0}dispose(){this.saoRenderTarget.dispose(),this.blurIntermediateRenderTarget.dispose(),this.normalRenderTarget.dispose(),this.normalMaterial.dispose(),this.saoMaterial.dispose(),this.vBlurMaterial.dispose(),this.hBlurMaterial.dispose(),this.materialCopy.dispose(),this.fsQuad.dispose()}_renderPass(e,t,s,r,i){e.getClearColor(this._originalClearColor);let n=e.getClearAlpha(),a=e.autoClear;e.setRenderTarget(s),e.autoClear=!1,null!=r&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.fsQuad.material=t,this.fsQuad.render(e),e.autoClear=a,e.setClearColor(this._originalClearColor),e.setClearAlpha(n)}_renderOverride(e,t,s,r,i){e.getClearColor(this._originalClearColor);let n=e.getClearAlpha(),a=e.autoClear;e.setRenderTarget(s),e.autoClear=!1,r=t.clearColor||r,i=t.clearAlpha||i,null!=r&&(e.setClearColor(r),e.setClearAlpha(i||0),e.clear()),this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=a,e.setClearColor(this._originalClearColor),e.setClearAlpha(n)}}u.OUTPUT={Default:0,SAO:1,Normal:2}},2521:(e,t,s)=>{s.d(t,{Cc:()=>n,pu:()=>a,qE:()=>i});let r=Math.PI/180;function i(e,t,s){return Math.max(t,Math.min(s,e))}function n(e,t,s){return(1-s)*e+s*t}function a(e){return e*r}},3133:(e,t,s)=>{s.d(t,{a0:()=>h,on:()=>o});var r=s(3720);let i=new r.Pq0,n=new r.PTz,a=new r.Pq0;class o extends r.B69{constructor(e=document.createElement("div")){super(),this.isCSS3DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.pointerEvents="auto",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.addEventListener("removed",function(){this.traverse(function(e){e.element instanceof e.element.ownerDocument.defaultView.Element&&null!==e.element.parentNode&&e.element.remove()})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this}}let l=new r.kn4,u=new r.kn4;class h{constructor(e={}){let t,s,r,o,h=this,c={camera:{style:""},objects:new WeakMap},d=void 0!==e.element?e.element:document.createElement("div");d.style.overflow="hidden",this.domElement=d;let m=document.createElement("div");m.style.transformOrigin="0 0",m.style.pointerEvents="none",d.appendChild(m);let f=document.createElement("div");function p(e){return 1e-10>Math.abs(e)?0:e}function g(e){let t=e.elements;return"matrix3d("+p(t[0])+","+p(-t[1])+","+p(t[2])+","+p(t[3])+","+p(t[4])+","+p(-t[5])+","+p(t[6])+","+p(t[7])+","+p(t[8])+","+p(-t[9])+","+p(t[10])+","+p(t[11])+","+p(t[12])+","+p(-t[13])+","+p(t[14])+","+p(t[15])+")"}function v(e){let t=e.elements;return"translate(-50%,-50%)"+("matrix3d("+p(t[0])+","+p(t[1])+","+p(t[2])+","+p(t[3])+","+p(-t[4])+","+p(-t[5])+","+p(-t[6])+","+p(-t[7])+","+p(t[8])+","+p(t[9])+","+p(t[10])+","+p(t[11])+","+p(t[12])+","+p(t[13])+","+p(t[14])+","+p(t[15]))+")"}f.style.transformStyle="preserve-3d",m.appendChild(f),this.getSize=function(){return{width:t,height:s}},this.render=function(e,d){let x,T,S=d.projectionMatrix.elements[5]*o;d.view&&d.view.enabled?(m.style.transform=`translate( ${-d.view.offsetX*(t/d.view.width)}px, ${-d.view.offsetY*(s/d.view.height)}px )`,m.style.transform+=`scale( ${d.view.fullWidth/d.view.width}, ${d.view.fullHeight/d.view.height} )`):m.style.transform="",!0===e.matrixWorldAutoUpdate&&e.updateMatrixWorld(),null===d.parent&&!0===d.matrixWorldAutoUpdate&&d.updateMatrixWorld(),d.isOrthographicCamera&&(x=-(d.right+d.left)/2,T=(d.top+d.bottom)/2);let w=d.view&&d.view.enabled?d.view.height/d.view.fullHeight:1,R=d.isOrthographicCamera?`scale( ${w} )scale(`+S+")translate("+p(x)+"px,"+p(T)+"px)"+g(d.matrixWorldInverse):`scale( ${w} )translateZ(`+S+"px)"+g(d.matrixWorldInverse),E=(d.isPerspectiveCamera?"perspective("+S+"px) ":"")+R+"translate("+r+"px,"+o+"px)";c.camera.style!==E&&(f.style.transform=E,c.camera.style=E),function e(t,s,r,o){if(!1===t.visible)return void function e(t){t.isCSS3DObject&&(t.element.style.display="none");for(let s=0,r=t.children.length;s<r;s++)e(t.children[s])}(t);if(t.isCSS3DObject){let e=!0===t.layers.test(r.layers),o=t.element;if(o.style.display=!0===e?"":"none",!0===e){let e;t.onBeforeRender(h,s,r),t.isCSS3DSprite?(l.copy(r.matrixWorldInverse),l.transpose(),0!==t.rotation2D&&l.multiply(u.makeRotationZ(t.rotation2D)),t.matrixWorld.decompose(i,n,a),l.setPosition(i),l.scale(a),l.elements[3]=0,l.elements[7]=0,l.elements[11]=0,l.elements[15]=1,e=v(l)):e=v(t.matrixWorld);let d=c.objects.get(t);if(void 0===d||d.style!==e){o.style.transform=e;let s={style:e};c.objects.set(t,s)}o.parentNode!==f&&f.appendChild(o),t.onAfterRender(h,s,r)}}for(let i=0,n=t.children.length;i<n;i++)e(t.children[i],s,r,o)}(e,e,d,R)},this.setSize=function(e,i){t=e,s=i,r=t/2,o=s/2,d.style.width=e+"px",d.style.height=i+"px",m.style.width=e+"px",m.style.height=i+"px",f.style.width=e+"px",f.style.height=i+"px"}}}},3779:(e,t,s)=>{s.d(t,{p:()=>n});var r=s(3720),i=s(7042);class n extends i.o{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof r.BKk?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=r.LlO.clone(e.uniforms),this.material=new r.BKk({name:void 0!==e.name?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new i.F(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this._fsQuad.material=this.material,this.renderToScreen?e.setRenderTarget(null):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)),this._fsQuad.render(e)}dispose(){this.material.dispose(),this._fsQuad.dispose()}}},3832:(e,t,s)=>{s.d(t,{s:()=>u});var r=s(3720),i=s(5864),n=s(3779),a=s(7042);class o extends a.o{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){let r,i,n=e.getContext(),a=e.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0),this.inverse?(r=0,i=1):(r=1,i=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(n.REPLACE,n.REPLACE,n.REPLACE),a.buffers.stencil.setFunc(n.ALWAYS,r,0xffffffff),a.buffers.stencil.setClear(i),a.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(n.EQUAL,1,0xffffffff),a.buffers.stencil.setOp(n.KEEP,n.KEEP,n.KEEP),a.buffers.stencil.setLocked(!0)}}class l extends a.o{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class u{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),void 0===t){let s=e.getSize(new r.I9Y);this._width=s.width,this._height=s.height,(t=new r.nWS(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:r.ix0})).texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new n.p(i.Z),this.copyPass.material.blending=r.XIg,this.clock=new r.zD7}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);-1!==t&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){void 0===e&&(e=this.clock.getDelta());let t=this.renderer.getRenderTarget(),s=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(!1!==r.enabled){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),r.needsSwap){if(s){let t=this.renderer.getContext(),s=this.renderer.state.buffers.stencil;s.setFunc(t.NOTEQUAL,1,0xffffffff),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),s.setFunc(t.EQUAL,1,0xffffffff)}this.swapBuffers()}void 0!==o&&(r instanceof o?s=!0:r instanceof l&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(void 0===e){let t=this.renderer.getSize(new r.I9Y);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,(e=this.renderTarget1.clone()).setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let s=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(s,r),this.renderTarget2.setSize(s,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(s,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}},5864:(e,t,s)=>{s.d(t,{Z:()=>r});let r={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`}},6233:(e,t,s)=>{s.d(t,{o:()=>r});let r={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new(s(3720)).I9Y(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`}},6990:(e,t,s)=>{s.d(t,{B:()=>n});var r=s(3720);function i(e,t){if(t===r.RJ4)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),e;if(t!==r.rYR&&t!==r.O49)return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),e;{let s=e.getIndex();if(null===s){let t=[],r=e.getAttribute("position");if(void 0===r)return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),e;for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),s=e.getIndex()}let i=s.count-2,n=[];if(t===r.rYR)for(let e=1;e<=i;e++)n.push(s.getX(0)),n.push(s.getX(e)),n.push(s.getX(e+1));else for(let e=0;e<i;e++)e%2==0?(n.push(s.getX(e)),n.push(s.getX(e+1)),n.push(s.getX(e+2))):(n.push(s.getX(e+2)),n.push(s.getX(e+1)),n.push(s.getX(e)));n.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let a=e.clone();return a.setIndex(n),a.clearGroups(),a}}class n extends r.aHM{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new c(e)}),this.register(function(e){return new d(e)}),this.register(function(e){return new w(e)}),this.register(function(e){return new R(e)}),this.register(function(e){return new E(e)}),this.register(function(e){return new f(e)}),this.register(function(e){return new p(e)}),this.register(function(e){return new g(e)}),this.register(function(e){return new v(e)}),this.register(function(e){return new h(e)}),this.register(function(e){return new x(e)}),this.register(function(e){return new m(e)}),this.register(function(e){return new S(e)}),this.register(function(e){return new T(e)}),this.register(function(e){return new l(e)}),this.register(function(e){return new _(e)}),this.register(function(e){return new y(e)})}load(e,t,s,i){let n,a=this;if(""!==this.resourcePath)n=this.resourcePath;else if(""!==this.path){let t=r.r6x.extractUrlBase(e);n=r.r6x.resolveURL(t,this.path)}else n=r.r6x.extractUrlBase(e);this.manager.itemStart(e);let o=function(t){i?i(t):console.error(t),a.manager.itemError(e),a.manager.itemEnd(e)},l=new r.Y9S(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(s){try{a.parse(s,n,function(s){t(s),a.manager.itemEnd(e)},o)}catch(e){o(e)}},s,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return -1===this.pluginCallbacks.indexOf(e)&&this.pluginCallbacks.push(e),this}unregister(e){return -1!==this.pluginCallbacks.indexOf(e)&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,s,r){let i,n={},a={},l=new TextDecoder;if("string"==typeof e)i=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===A){try{n[o.KHR_BINARY_GLTF]=new C(e)}catch(e){r&&r(e);return}i=JSON.parse(n[o.KHR_BINARY_GLTF].content)}else i=JSON.parse(l.decode(e));else i=e;if(void 0===i.asset||i.asset.version[0]<2){r&&r(Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let h=new Z(i,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});h.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](h);t.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[t.name]=t,n[t.name]=!0}if(i.extensionsUsed)for(let e=0;e<i.extensionsUsed.length;++e){let t=i.extensionsUsed[e],s=i.extensionsRequired||[];switch(t){case o.KHR_MATERIALS_UNLIT:n[t]=new u;break;case o.KHR_DRACO_MESH_COMPRESSION:n[t]=new b(i,this.dracoLoader);break;case o.KHR_TEXTURE_TRANSFORM:n[t]=new D;break;case o.KHR_MESH_QUANTIZATION:n[t]=new P;break;default:s.indexOf(t)>=0&&void 0===a[t]&&console.warn('THREE.GLTFLoader: Unknown extension "'+t+'".')}}h.setExtensions(n),h.setPlugins(a),h.parse(s,r)}parseAsync(e,t){let s=this;return new Promise(function(r,i){s.parse(e,t,r,i)})}}function a(){let e={};return{get:function(t){return e[t]},add:function(t,s){e[t]=s},remove:function(t){delete e[t]},removeAll:function(){e={}}}}let o={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class l{constructor(e){this.parser=e,this.name=o.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let s=0,r=t.length;s<r;s++){let r=t[s];r.extensions&&r.extensions[this.name]&&void 0!==r.extensions[this.name].light&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t,s=this.parser,i="light:"+e,n=s.cache.get(i);if(n)return n;let a=s.json,o=((a.extensions&&a.extensions[this.name]||{}).lights||[])[e],l=new r.Q1f(0xffffff);void 0!==o.color&&l.setRGB(o.color[0],o.color[1],o.color[2],r.Zr2);let u=void 0!==o.range?o.range:0;switch(o.type){case"directional":(t=new r.ZyN(l)).target.position.set(0,0,-1),t.add(t.target);break;case"point":(t=new r.HiM(l)).distance=u;break;case"spot":(t=new r.nCl(l)).distance=u,o.spot=o.spot||{},o.spot.innerConeAngle=void 0!==o.spot.innerConeAngle?o.spot.innerConeAngle:0,o.spot.outerConeAngle=void 0!==o.spot.outerConeAngle?o.spot.outerConeAngle:Math.PI/4,t.angle=o.spot.outerConeAngle,t.penumbra=1-o.spot.innerConeAngle/o.spot.outerConeAngle,t.target.position.set(0,0,-1),t.add(t.target);break;default:throw Error("THREE.GLTFLoader: Unexpected light type: "+o.type)}return t.position.set(0,0,0),K(t,o),void 0!==o.intensity&&(t.intensity=o.intensity),t.name=s.createUniqueName(o.name||"light_"+e),n=Promise.resolve(t),s.cache.add(i,n),n}getDependency(e,t){if("light"===e)return this._loadLight(t)}createNodeAttachment(e){let t=this,s=this.parser,r=s.json.nodes[e],i=(r.extensions&&r.extensions[this.name]||{}).light;return void 0===i?null:this._loadLight(i).then(function(e){return s._getNodeRef(t.cache,i,e)})}}class u{constructor(){this.name=o.KHR_MATERIALS_UNLIT}getMaterialType(){return r.V9B}extendParams(e,t,s){let i=[];e.color=new r.Q1f(1,1,1),e.opacity=1;let n=t.pbrMetallicRoughness;if(n){if(Array.isArray(n.baseColorFactor)){let t=n.baseColorFactor;e.color.setRGB(t[0],t[1],t[2],r.Zr2),e.opacity=t[3]}void 0!==n.baseColorTexture&&i.push(s.assignTexture(e,"map",n.baseColorTexture,r.er$))}return Promise.all(i)}}class h{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name].emissiveStrength;return void 0!==r&&(t.emissiveIntensity=r),Promise.resolve()}}class c{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser,i=s.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let n=[],a=i.extensions[this.name];if(void 0!==a.clearcoatFactor&&(t.clearcoat=a.clearcoatFactor),void 0!==a.clearcoatTexture&&n.push(s.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),void 0!==a.clearcoatRoughnessFactor&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),void 0!==a.clearcoatRoughnessTexture&&n.push(s.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),void 0!==a.clearcoatNormalTexture&&(n.push(s.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),void 0!==a.clearcoatNormalTexture.scale)){let e=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new r.I9Y(e,e)}return Promise.all(n)}}class d{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_DISPERSION}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.dispersion=void 0!==r.dispersion?r.dispersion:0,Promise.resolve()}}class m{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser,r=s.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],n=r.extensions[this.name];return void 0!==n.iridescenceFactor&&(t.iridescence=n.iridescenceFactor),void 0!==n.iridescenceTexture&&i.push(s.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),void 0!==n.iridescenceIor&&(t.iridescenceIOR=n.iridescenceIor),void 0===t.iridescenceThicknessRange&&(t.iridescenceThicknessRange=[100,400]),void 0!==n.iridescenceThicknessMinimum&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),void 0!==n.iridescenceThicknessMaximum&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),void 0!==n.iridescenceThicknessTexture&&i.push(s.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(i)}}class f{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_SHEEN}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser,i=s.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let n=[];t.sheenColor=new r.Q1f(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=i.extensions[this.name];if(void 0!==a.sheenColorFactor){let e=a.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],r.Zr2)}return void 0!==a.sheenRoughnessFactor&&(t.sheenRoughness=a.sheenRoughnessFactor),void 0!==a.sheenColorTexture&&n.push(s.assignTexture(t,"sheenColorMap",a.sheenColorTexture,r.er$)),void 0!==a.sheenRoughnessTexture&&n.push(s.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(n)}}class p{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser,r=s.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],n=r.extensions[this.name];return void 0!==n.transmissionFactor&&(t.transmission=n.transmissionFactor),void 0!==n.transmissionTexture&&i.push(s.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(i)}}class g{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_VOLUME}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser,i=s.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let n=[],a=i.extensions[this.name];t.thickness=void 0!==a.thicknessFactor?a.thicknessFactor:0,void 0!==a.thicknessTexture&&n.push(s.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let o=a.attenuationColor||[1,1,1];return t.attenuationColor=new r.Q1f().setRGB(o[0],o[1],o[2],r.Zr2),Promise.all(n)}}class v{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_IOR}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.ior=void 0!==r.ior?r.ior:1.5,Promise.resolve()}}class x{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_SPECULAR}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser,i=s.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let n=[],a=i.extensions[this.name];t.specularIntensity=void 0!==a.specularFactor?a.specularFactor:1,void 0!==a.specularTexture&&n.push(s.assignTexture(t,"specularIntensityMap",a.specularTexture));let o=a.specularColorFactor||[1,1,1];return t.specularColor=new r.Q1f().setRGB(o[0],o[1],o[2],r.Zr2),void 0!==a.specularColorTexture&&n.push(s.assignTexture(t,"specularColorMap",a.specularColorTexture,r.er$)),Promise.all(n)}}class T{constructor(e){this.parser=e,this.name=o.EXT_MATERIALS_BUMP}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser,r=s.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],n=r.extensions[this.name];return t.bumpScale=void 0!==n.bumpFactor?n.bumpFactor:1,void 0!==n.bumpTexture&&i.push(s.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(i)}}class S{constructor(e){this.parser=e,this.name=o.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?r.uSd:null}extendMaterialParams(e,t){let s=this.parser,r=s.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],n=r.extensions[this.name];return void 0!==n.anisotropyStrength&&(t.anisotropy=n.anisotropyStrength),void 0!==n.anisotropyRotation&&(t.anisotropyRotation=n.anisotropyRotation),void 0!==n.anisotropyTexture&&i.push(s.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(i)}}class w{constructor(e){this.parser=e,this.name=o.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,s=t.json,r=s.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let i=r.extensions[this.name],n=t.options.ktx2Loader;if(!n)if(!(s.extensionsRequired&&s.extensionsRequired.indexOf(this.name)>=0))return null;else throw Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return t.loadTextureImage(e,i.source,n)}}class R{constructor(e){this.parser=e,this.name=o.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,s=this.parser,r=s.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let n=i.extensions[t],a=r.images[n.source],o=s.textureLoader;if(a.uri){let e=s.options.manager.getHandler(a.uri);null!==e&&(o=e)}return s.loadTextureImage(e,n.source,o)}}class E{constructor(e){this.parser=e,this.name=o.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,s=this.parser,r=s.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let n=i.extensions[t],a=r.images[n.source],o=s.textureLoader;if(a.uri){let e=s.options.manager.getHandler(a.uri);null!==e&&(o=e)}return s.loadTextureImage(e,n.source,o)}}class _{constructor(e){this.name=o.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,s=t.bufferViews[e];if(!s.extensions||!s.extensions[this.name])return null;{let e=s.extensions[this.name],r=this.parser.getDependency("buffer",e.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported)if(!(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0))return null;else throw Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return r.then(function(t){let s=e.byteOffset||0,r=e.byteLength||0,n=e.count,a=e.byteStride,o=new Uint8Array(t,s,r);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(n,a,o,e.mode,e.filter).then(function(e){return e.buffer}):i.ready.then(function(){let t=new ArrayBuffer(n*a);return i.decodeGltfBuffer(new Uint8Array(t),n,a,o,e.mode,e.filter),t})})}}}class y{constructor(e){this.name=o.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,s=t.nodes[e];if(!s.extensions||!s.extensions[this.name]||void 0===s.mesh)return null;for(let e of t.meshes[s.mesh].primitives)if(e.mode!==O.TRIANGLES&&e.mode!==O.TRIANGLE_STRIP&&e.mode!==O.TRIANGLE_FAN&&void 0!==e.mode)return null;let i=s.extensions[this.name].attributes,n=[],a={};for(let e in i)n.push(this.parser.getDependency("accessor",i[e]).then(t=>(a[e]=t,a[e])));return n.length<1?null:(n.push(this.parser.createNodeMesh(e)),Promise.all(n).then(e=>{let t=e.pop(),s=t.isGroup?t.children:[t],i=e[0].count,n=[];for(let e of s){let t=new r.kn4,s=new r.Pq0,o=new r.PTz,l=new r.Pq0(1,1,1),u=new r.ZLX(e.geometry,e.material,i);for(let e=0;e<i;e++)a.TRANSLATION&&s.fromBufferAttribute(a.TRANSLATION,e),a.ROTATION&&o.fromBufferAttribute(a.ROTATION,e),a.SCALE&&l.fromBufferAttribute(a.SCALE,e),u.setMatrixAt(e,t.compose(s,o,l));for(let t in a)if("_COLOR_0"===t){let e=a[t];u.instanceColor=new r.uWO(e.array,e.itemSize,e.normalized)}else"TRANSLATION"!==t&&"ROTATION"!==t&&"SCALE"!==t&&e.geometry.setAttribute(t,a[t]);r.B69.prototype.copy.call(u,e),this.parser.assignFinalMaterial(u),n.push(u)}return t.isGroup?(t.clear(),t.add(...n),t):n[0]}))}}let A="glTF",M={JSON:0x4e4f534a,BIN:5130562};class C{constructor(e){this.name=o.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,12),s=new TextDecoder;if(this.header={magic:s.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==A)throw Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw Error("THREE.GLTFLoader: Legacy binary file detected.");let r=this.header.length-12,i=new DataView(e,12),n=0;for(;n<r;){let t=i.getUint32(n,!0);n+=4;let r=i.getUint32(n,!0);if(n+=4,r===M.JSON){let r=new Uint8Array(e,12+n,t);this.content=s.decode(r)}else if(r===M.BIN){let s=12+n;this.body=e.slice(s,s+t)}n+=t}if(null===this.content)throw Error("THREE.GLTFLoader: JSON content not found.")}}class b{constructor(e,t){if(!t)throw Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=o.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let s=this.json,i=this.dracoLoader,n=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},u={};for(let e in a)o[F[e]||e.toLowerCase()]=a[e];for(let t in e.attributes){let r=F[t]||t.toLowerCase();if(void 0!==a[t]){let i=s.accessors[e.attributes[t]],n=U[i.componentType];u[r]=n.name,l[r]=!0===i.normalized}}return t.getDependency("bufferView",n).then(function(e){return new Promise(function(t,s){i.decodeDracoFile(e,function(e){for(let t in e.attributes){let s=e.attributes[t],r=l[t];void 0!==r&&(s.normalized=r)}t(e)},o,u,r.Zr2,s)})})}}class D{constructor(){this.name=o.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(void 0===t.texCoord||t.texCoord===e.channel)&&void 0===t.offset&&void 0===t.rotation&&void 0===t.scale||(e=e.clone(),void 0!==t.texCoord&&(e.channel=t.texCoord),void 0!==t.offset&&e.offset.fromArray(t.offset),void 0!==t.rotation&&(e.rotation=t.rotation),void 0!==t.scale&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class P{constructor(){this.name=o.KHR_MESH_QUANTIZATION}}class L extends r.lGw{constructor(e,t,s,r){super(e,t,s,r)}copySampleValue_(e){let t=this.resultBuffer,s=this.sampleValues,r=this.valueSize,i=e*r*3+r;for(let e=0;e!==r;e++)t[e]=s[i+e];return t}interpolate_(e,t,s,r){let i=this.resultBuffer,n=this.sampleValues,a=this.valueSize,o=2*a,l=3*a,u=r-t,h=(s-t)/u,c=h*h,d=c*h,m=e*l,f=m-l,p=-2*d+3*c,g=d-c,v=1-p,x=g-c+h;for(let e=0;e!==a;e++){let t=n[f+e+a],s=n[f+e+o]*u,r=n[m+e+a],l=n[m+e]*u;i[e]=v*t+x*s+p*r+g*l}return i}}let I=new r.PTz;class N extends L{interpolate_(e,t,s,r){let i=super.interpolate_(e,t,s,r);return I.fromArray(i).normalize().toArray(i),i}}let O={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},U={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},B={9728:r.hxR,9729:r.k6q,9984:r.pHI,9985:r.kRr,9986:r.Cfg,9987:r.$_I},k={33071:r.ghU,33648:r.kTW,10497:r.GJx},H={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},F={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},j={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},V={CUBICSPLINE:void 0,LINEAR:r.PJ3,STEP:r.ljd},G={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function z(e,t,s){for(let r in s.extensions)void 0===e[r]&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=s.extensions[r])}function K(e,t){void 0!==t.extras&&("object"==typeof t.extras?Object.assign(e.userData,t.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+t.extras))}function X(e){let t="",s=Object.keys(e).sort();for(let r=0,i=s.length;r<i;r++)t+=s[r]+":"+e[s[r]]+";";return t}function q(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}let W=new r.kn4;class Z{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new a,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let s=!1,i=-1,n=!1,o=-1;if("undefined"!=typeof navigator){let e=navigator.userAgent;s=!0===/^((?!chrome|android).)*safari/i.test(e);let t=e.match(/Version\/(\d+)/);i=s&&t?parseInt(t[1],10):-1,o=(n=e.indexOf("Firefox")>-1)?e.match(/Firefox\/([0-9]+)\./)[1]:-1}"undefined"==typeof createImageBitmap||s&&i<17||n&&o<98?this.textureLoader=new r.Tap(this.options.manager):this.textureLoader=new r.Kzg(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new r.Y9S(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),"use-credentials"===this.options.crossOrigin&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let s=this,r=this.json,i=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([s.getDependencies("scene"),s.getDependencies("animation"),s.getDependencies("camera")])}).then(function(t){let n={scene:t[0][r.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:r.asset,parser:s,userData:{}};return z(i,n,r),K(n,r),Promise.all(s._invokeAll(function(e){return e.afterRoot&&e.afterRoot(n)})).then(function(){for(let e of n.scenes)e.updateMatrixWorld();e(n)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],s=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let r=t[s].joints;for(let t=0,s=r.length;t<s;t++)e[r[t]].isBone=!0}for(let t=0,r=e.length;t<r;t++){let r=e[t];void 0!==r.mesh&&(this._addNodeRef(this.meshCache,r.mesh),void 0!==r.skin&&(s[r.mesh].isSkinnedMesh=!0)),void 0!==r.camera&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){void 0!==t&&(void 0===e.refs[t]&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,s){if(e.refs[t]<=1)return s;let r=s.clone(),i=(e,t)=>{let s=this.associations.get(e);for(let[r,n]of(null!=s&&this.associations.set(t,s),e.children.entries()))i(n,t.children[r])};return i(s,r),r.name+="_instance_"+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let s=0;s<t.length;s++){let r=e(t[s]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let s=[];for(let r=0;r<t.length;r++){let i=e(t[r]);i&&s.push(i)}return s}getDependency(e,t){let s=e+":"+t,r=this.cache.get(s);if(!r){switch(e){case"scene":r=this.loadScene(t);break;case"node":r=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case"mesh":r=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case"accessor":r=this.loadAccessor(t);break;case"bufferView":r=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case"buffer":r=this.loadBuffer(t);break;case"material":r=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case"texture":r=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case"skin":r=this.loadSkin(t);break;case"animation":r=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case"camera":r=this.loadCamera(t);break;default:if(!(r=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)})))throw Error("Unknown type: "+e)}this.cache.add(s,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let s=this;t=Promise.all((this.json[e+("mesh"===e?"es":"s")]||[]).map(function(t,r){return s.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],s=this.fileLoader;if(t.type&&"arraybuffer"!==t.type)throw Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(void 0===t.uri&&0===e)return Promise.resolve(this.extensions[o.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(e,n){s.load(r.r6x.resolveURL(t.uri,i.path),e,void 0,function(){n(Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(e){let s=t.byteLength||0,r=t.byteOffset||0;return e.slice(r,r+s)})}loadAccessor(e){let t=this,s=this.json,i=this.json.accessors[e];if(void 0===i.bufferView&&void 0===i.sparse){let e=H[i.type],t=U[i.componentType],s=!0===i.normalized,n=new t(i.count*e);return Promise.resolve(new r.THS(n,e,s))}let n=[];return void 0!==i.bufferView?n.push(this.getDependency("bufferView",i.bufferView)):n.push(null),void 0!==i.sparse&&(n.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),n.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(n).then(function(e){let n,a,o=e[0],l=H[i.type],u=U[i.componentType],h=u.BYTES_PER_ELEMENT,c=h*l,d=i.byteOffset||0,m=void 0!==i.bufferView?s.bufferViews[i.bufferView].byteStride:void 0,f=!0===i.normalized;if(m&&m!==c){let e=Math.floor(d/m),s="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+e+":"+i.count,c=t.cache.get(s);c||(n=new u(o,e*m,i.count*m/h),c=new r.eB$(n,m/h),t.cache.add(s,c)),a=new r.eHs(c,l,d%m/h,f)}else n=null===o?new u(i.count*l):new u(o,d,i.count*l),a=new r.THS(n,l,f);if(void 0!==i.sparse){let t=H.SCALAR,s=U[i.sparse.indices.componentType],n=i.sparse.indices.byteOffset||0,h=i.sparse.values.byteOffset||0,c=new s(e[1],n,i.sparse.count*t),d=new u(e[2],h,i.sparse.count*l);null!==o&&(a=new r.THS(a.array.slice(),a.itemSize,a.normalized)),a.normalized=!1;for(let e=0,t=c.length;e<t;e++){let t=c[e];if(a.setX(t,d[e*l]),l>=2&&a.setY(t,d[e*l+1]),l>=3&&a.setZ(t,d[e*l+2]),l>=4&&a.setW(t,d[e*l+3]),l>=5)throw Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}a.normalized=f}return a})}loadTexture(e){let t=this.json,s=this.options,r=t.textures[e].source,i=t.images[r],n=this.textureLoader;if(i.uri){let e=s.manager.getHandler(i.uri);null!==e&&(n=e)}return this.loadTextureImage(e,r,n)}loadTextureImage(e,t,s){let i=this,n=this.json,a=n.textures[e],o=n.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];let u=this.loadImageSource(t,s).then(function(t){t.flipY=!1,t.name=a.name||o.name||"",""===t.name&&"string"==typeof o.uri&&!1===o.uri.startsWith("data:image/")&&(t.name=o.uri);let s=(n.samplers||{})[a.sampler]||{};return t.magFilter=B[s.magFilter]||r.k6q,t.minFilter=B[s.minFilter]||r.$_I,t.wrapS=k[s.wrapS]||r.GJx,t.wrapT=k[s.wrapT]||r.GJx,t.generateMipmaps=!t.isCompressedTexture&&t.minFilter!==r.hxR&&t.minFilter!==r.k6q,i.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[l]=u,u}loadImageSource(e,t){let s=this.json,i=this.options;if(void 0!==this.sourceCache[e])return this.sourceCache[e].then(e=>e.clone());let n=s.images[e],a=self.URL||self.webkitURL,o=n.uri||"",l=!1;if(void 0!==n.bufferView)o=this.getDependency("bufferView",n.bufferView).then(function(e){l=!0;let t=new Blob([e],{type:n.mimeType});return o=a.createObjectURL(t)});else if(void 0===n.uri)throw Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(o).then(function(e){return new Promise(function(s,n){let a=s;!0===t.isImageBitmapLoader&&(a=function(e){let t=new r.gPd(e);t.needsUpdate=!0,s(t)}),t.load(r.r6x.resolveURL(e,i.path),a,void 0,n)})}).then(function(e){var t;return!0===l&&a.revokeObjectURL(o),K(e,n),e.userData.mimeType=n.mimeType||((t=n.uri).search(/\.jpe?g($|\?)/i)>0||0===t.search(/^data\:image\/jpeg/)?"image/jpeg":t.search(/\.webp($|\?)/i)>0||0===t.search(/^data\:image\/webp/)?"image/webp":t.search(/\.ktx2($|\?)/i)>0||0===t.search(/^data\:image\/ktx2/)?"image/ktx2":"image/png"),e}).catch(function(e){throw console.error("THREE.GLTFLoader: Couldn't load texture",o),e});return this.sourceCache[e]=u,u}assignTexture(e,t,s,r){let i=this;return this.getDependency("texture",s.index).then(function(n){if(!n)return null;if(void 0!==s.texCoord&&s.texCoord>0&&((n=n.clone()).channel=s.texCoord),i.extensions[o.KHR_TEXTURE_TRANSFORM]){let e=void 0!==s.extensions?s.extensions[o.KHR_TEXTURE_TRANSFORM]:void 0;if(e){let t=i.associations.get(n);n=i.extensions[o.KHR_TEXTURE_TRANSFORM].extendTexture(n,e),i.associations.set(n,t)}}return void 0!==r&&(n.colorSpace=r),e[t]=n,n})}assignFinalMaterial(e){let t=e.geometry,s=e.material,i=void 0===t.attributes.tangent,n=void 0!==t.attributes.color,a=void 0===t.attributes.normal;if(e.isPoints){let e="PointsMaterial:"+s.uuid,t=this.cache.get(e);t||(t=new r.BH$,r.imn.prototype.copy.call(t,s),t.color.copy(s.color),t.map=s.map,t.sizeAttenuation=!1,this.cache.add(e,t)),s=t}else if(e.isLine){let e="LineBasicMaterial:"+s.uuid,t=this.cache.get(e);t||(t=new r.mrM,r.imn.prototype.copy.call(t,s),t.color.copy(s.color),t.map=s.map,this.cache.add(e,t)),s=t}if(i||n||a){let e="ClonedMaterial:"+s.uuid+":";i&&(e+="derivative-tangents:"),n&&(e+="vertex-colors:"),a&&(e+="flat-shading:");let t=this.cache.get(e);t||(t=s.clone(),n&&(t.vertexColors=!0),a&&(t.flatShading=!0),i&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(s))),s=t}e.material=s}getMaterialType(){return r._4j}loadMaterial(e){let t,s=this,i=this.json,n=this.extensions,a=i.materials[e],l={},u=a.extensions||{},h=[];if(u[o.KHR_MATERIALS_UNLIT]){let e=n[o.KHR_MATERIALS_UNLIT];t=e.getMaterialType(),h.push(e.extendParams(l,a,s))}else{let i=a.pbrMetallicRoughness||{};if(l.color=new r.Q1f(1,1,1),l.opacity=1,Array.isArray(i.baseColorFactor)){let e=i.baseColorFactor;l.color.setRGB(e[0],e[1],e[2],r.Zr2),l.opacity=e[3]}void 0!==i.baseColorTexture&&h.push(s.assignTexture(l,"map",i.baseColorTexture,r.er$)),l.metalness=void 0!==i.metallicFactor?i.metallicFactor:1,l.roughness=void 0!==i.roughnessFactor?i.roughnessFactor:1,void 0!==i.metallicRoughnessTexture&&(h.push(s.assignTexture(l,"metalnessMap",i.metallicRoughnessTexture)),h.push(s.assignTexture(l,"roughnessMap",i.metallicRoughnessTexture))),t=this._invokeOne(function(t){return t.getMaterialType&&t.getMaterialType(e)}),h.push(Promise.all(this._invokeAll(function(t){return t.extendMaterialParams&&t.extendMaterialParams(e,l)})))}!0===a.doubleSided&&(l.side=r.$EB);let c=a.alphaMode||G.OPAQUE;if(c===G.BLEND?(l.transparent=!0,l.depthWrite=!1):(l.transparent=!1,c===G.MASK&&(l.alphaTest=void 0!==a.alphaCutoff?a.alphaCutoff:.5)),void 0!==a.normalTexture&&t!==r.V9B&&(h.push(s.assignTexture(l,"normalMap",a.normalTexture)),l.normalScale=new r.I9Y(1,1),void 0!==a.normalTexture.scale)){let e=a.normalTexture.scale;l.normalScale.set(e,e)}if(void 0!==a.occlusionTexture&&t!==r.V9B&&(h.push(s.assignTexture(l,"aoMap",a.occlusionTexture)),void 0!==a.occlusionTexture.strength&&(l.aoMapIntensity=a.occlusionTexture.strength)),void 0!==a.emissiveFactor&&t!==r.V9B){let e=a.emissiveFactor;l.emissive=new r.Q1f().setRGB(e[0],e[1],e[2],r.Zr2)}return void 0!==a.emissiveTexture&&t!==r.V9B&&h.push(s.assignTexture(l,"emissiveMap",a.emissiveTexture,r.er$)),Promise.all(h).then(function(){let r=new t(l);return a.name&&(r.name=a.name),K(r,a),s.associations.set(r,{materials:e}),a.extensions&&z(n,r,a),r})}createUniqueName(e){let t=r.Nwf.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,s=this.extensions,i=this.primitiveCache,n=[];for(let a=0,l=e.length;a<l;a++){let l=e[a],u=function(e){let t,s=e.extensions&&e.extensions[o.KHR_DRACO_MESH_COMPRESSION];if(t=s?"draco:"+s.bufferView+":"+s.indices+":"+X(s.attributes):e.indices+":"+X(e.attributes)+":"+e.mode,void 0!==e.targets)for(let s=0,r=e.targets.length;s<r;s++)t+=":"+X(e.targets[s]);return t}(l),h=i[u];if(h)n.push(h.promise);else{let e;e=l.extensions&&l.extensions[o.KHR_DRACO_MESH_COMPRESSION]?function(e){return s[o.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(s){return Y(s,e,t)})}(l):Y(new r.LoY,l,t),i[u]={primitive:l,promise:e},n.push(e)}}return Promise.all(n)}loadMesh(e){let t=this,s=this.json,n=this.extensions,a=s.meshes[e],o=a.primitives,l=[];for(let e=0,t=o.length;e<t;e++){var u;let t=void 0===o[e].material?(void 0===(u=this.cache).DefaultMaterial&&(u.DefaultMaterial=new r._4j({color:0xffffff,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:r.hB5})),u.DefaultMaterial):this.getDependency("material",o[e].material);l.push(t)}return l.push(t.loadGeometries(o)),Promise.all(l).then(function(s){let l=s.slice(0,s.length-1),u=s[s.length-1],h=[];for(let s=0,c=u.length;s<c;s++){let c,d=u[s],m=o[s],f=l[s];if(m.mode===O.TRIANGLES||m.mode===O.TRIANGLE_STRIP||m.mode===O.TRIANGLE_FAN||void 0===m.mode)!0===(c=!0===a.isSkinnedMesh?new r.I46(d,f):new r.eaF(d,f)).isSkinnedMesh&&c.normalizeSkinWeights(),m.mode===O.TRIANGLE_STRIP?c.geometry=i(c.geometry,r.O49):m.mode===O.TRIANGLE_FAN&&(c.geometry=i(c.geometry,r.rYR));else if(m.mode===O.LINES)c=new r.DXC(d,f);else if(m.mode===O.LINE_STRIP)c=new r.N1A(d,f);else if(m.mode===O.LINE_LOOP)c=new r.FCc(d,f);else if(m.mode===O.POINTS)c=new r.ONl(d,f);else throw Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(c.geometry.morphAttributes).length>0&&function(e,t){if(e.updateMorphTargets(),void 0!==t.weights)for(let s=0,r=t.weights.length;s<r;s++)e.morphTargetInfluences[s]=t.weights[s];if(t.extras&&Array.isArray(t.extras.targetNames)){let s=t.extras.targetNames;if(e.morphTargetInfluences.length===s.length){e.morphTargetDictionary={};for(let t=0,r=s.length;t<r;t++)e.morphTargetDictionary[s[t]]=t}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}(c,a),c.name=t.createUniqueName(a.name||"mesh_"+e),K(c,a),m.extensions&&z(n,c,m),t.assignFinalMaterial(c),h.push(c)}for(let s=0,r=h.length;s<r;s++)t.associations.set(h[s],{meshes:e,primitives:s});if(1===h.length)return a.extensions&&z(n,h[0],a),h[0];let c=new r.YJl;a.extensions&&z(n,c,a),t.associations.set(c,{meshes:e});for(let e=0,t=h.length;e<t;e++)c.add(h[e]);return c})}loadCamera(e){let t,s=this.json.cameras[e],i=s[s.type];return i?("perspective"===s.type?t=new r.ubm(r.cj9.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):"orthographic"===s.type&&(t=new r.qUd(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),s.name&&(t.name=this.createUniqueName(s.name)),K(t,s),Promise.resolve(t)):void console.warn("THREE.GLTFLoader: Missing camera parameters.")}loadSkin(e){let t=this.json.skins[e],s=[];for(let e=0,r=t.joints.length;e<r;e++)s.push(this._loadNodeShallow(t.joints[e]));return void 0!==t.inverseBindMatrices?s.push(this.getDependency("accessor",t.inverseBindMatrices)):s.push(null),Promise.all(s).then(function(e){let s=e.pop(),i=[],n=[];for(let a=0,o=e.length;a<o;a++){let o=e[a];if(o){i.push(o);let e=new r.kn4;null!==s&&e.fromArray(s.array,16*a),n.push(e)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[a])}return new r.EAD(i,n)})}loadAnimation(e){let t=this.json,s=this,i=t.animations[e],n=i.name?i.name:"animation_"+e,a=[],o=[],l=[],u=[],h=[];for(let e=0,t=i.channels.length;e<t;e++){let t=i.channels[e],s=i.samplers[t.sampler],r=t.target,n=r.node,c=void 0!==i.parameters?i.parameters[s.input]:s.input,d=void 0!==i.parameters?i.parameters[s.output]:s.output;void 0!==r.node&&(a.push(this.getDependency("node",n)),o.push(this.getDependency("accessor",c)),l.push(this.getDependency("accessor",d)),u.push(s),h.push(r))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(u),Promise.all(h)]).then(function(e){let t=e[0],i=e[1],a=e[2],o=e[3],l=e[4],u=[];for(let e=0,r=t.length;e<r;e++){let r=t[e],n=i[e],h=a[e],c=o[e],d=l[e];if(void 0===r)continue;r.updateMatrix&&r.updateMatrix();let m=s._createAnimationTracks(r,n,h,c,d);if(m)for(let e=0;e<m.length;e++)u.push(m[e])}return new r.tz3(n,void 0,u)})}createNodeMesh(e){let t=this.json,s=this,r=t.nodes[e];return void 0===r.mesh?null:s.getDependency("mesh",r.mesh).then(function(e){let t=s._getNodeRef(s.meshCache,r.mesh,e);return void 0!==r.weights&&t.traverse(function(e){if(e.isMesh)for(let t=0,s=r.weights.length;t<s;t++)e.morphTargetInfluences[t]=r.weights[t]}),t})}loadNode(e){let t=this.json.nodes[e],s=this._loadNodeShallow(e),r=[],i=t.children||[];for(let e=0,t=i.length;e<t;e++)r.push(this.getDependency("node",i[e]));let n=void 0===t.skin?Promise.resolve(null):this.getDependency("skin",t.skin);return Promise.all([s,Promise.all(r),n]).then(function(e){let t=e[0],s=e[1],r=e[2];null!==r&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(r,W)});for(let e=0,r=s.length;e<r;e++)t.add(s[e]);return t})}_loadNodeShallow(e){let t=this.json,s=this.extensions,i=this;if(void 0!==this.nodeCache[e])return this.nodeCache[e];let n=t.nodes[e],a=n.name?i.createUniqueName(n.name):"",o=[],l=i._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return l&&o.push(l),void 0!==n.camera&&o.push(i.getDependency("camera",n.camera).then(function(e){return i._getNodeRef(i.cameraCache,n.camera,e)})),i._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){o.push(e)}),this.nodeCache[e]=Promise.all(o).then(function(t){let o;if((o=!0===n.isBone?new r.$Kf:t.length>1?new r.YJl:1===t.length?t[0]:new r.B69)!==t[0])for(let e=0,s=t.length;e<s;e++)o.add(t[e]);if(n.name&&(o.userData.name=n.name,o.name=a),K(o,n),n.extensions&&z(s,o,n),void 0!==n.matrix){let e=new r.kn4;e.fromArray(n.matrix),o.applyMatrix4(e)}else void 0!==n.translation&&o.position.fromArray(n.translation),void 0!==n.rotation&&o.quaternion.fromArray(n.rotation),void 0!==n.scale&&o.scale.fromArray(n.scale);if(i.associations.has(o)){if(void 0!==n.mesh&&i.meshCache.refs[n.mesh]>1){let e=i.associations.get(o);i.associations.set(o,{...e})}}else i.associations.set(o,{});return i.associations.get(o).nodes=e,o}),this.nodeCache[e]}loadScene(e){let t=this.extensions,s=this.json.scenes[e],i=this,n=new r.YJl;s.name&&(n.name=i.createUniqueName(s.name)),K(n,s),s.extensions&&z(t,n,s);let a=s.nodes||[],o=[];for(let e=0,t=a.length;e<t;e++)o.push(i.getDependency("node",a[e]));return Promise.all(o).then(function(e){for(let t=0,s=e.length;t<s;t++)n.add(e[t]);return i.associations=(e=>{let t=new Map;for(let[e,s]of i.associations)(e instanceof r.imn||e instanceof r.gPd)&&t.set(e,s);return e.traverse(e=>{let s=i.associations.get(e);null!=s&&t.set(e,s)}),t})(n),n})}_createAnimationTracks(e,t,s,i,n){let a,o=[],l=e.name?e.name:e.uuid,u=[];switch(j[n.path]===j.weights?e.traverse(function(e){e.morphTargetInfluences&&u.push(e.name?e.name:e.uuid)}):u.push(l),j[n.path]){case j.weights:a=r.Hit;break;case j.rotation:a=r.MBL;break;case j.translation:case j.scale:a=r.RiT;break;default:a=1===s.itemSize?r.Hit:r.RiT}let h=void 0!==i.interpolation?V[i.interpolation]:r.PJ3,c=this._getArrayFromAccessor(s);for(let e=0,s=u.length;e<s;e++){let s=new a(u[e]+"."+j[n.path],t.array,c,h);"CUBICSPLINE"===i.interpolation&&this._createCubicSplineTrackInterpolant(s),o.push(s)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=q(t.constructor),s=new Float32Array(t.length);for(let r=0,i=t.length;r<i;r++)s[r]=t[r]*e;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof r.MBL?N:L)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Y(e,t,s){let i=t.attributes,n=[];for(let t in i){let r=F[t]||t.toLowerCase();r in e.attributes||n.push(function(t,r){return s.getDependency("accessor",t).then(function(t){e.setAttribute(r,t)})}(i[t],r))}if(void 0!==t.indices&&!e.index){let r=s.getDependency("accessor",t.indices).then(function(t){e.setIndex(t)});n.push(r)}return r.ppV.workingColorSpace!==r.Zr2&&"COLOR_0"in i&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${r.ppV.workingColorSpace}" not supported.`),K(e,t),!function(e,t,s){let i=t.attributes,n=new r.NRn;if(void 0===i.POSITION)return;{let e=s.json.accessors[i.POSITION],t=e.min,a=e.max;if(void 0===t||void 0===a)return console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");if(n.set(new r.Pq0(t[0],t[1],t[2]),new r.Pq0(a[0],a[1],a[2])),e.normalized){let t=q(U[e.componentType]);n.min.multiplyScalar(t),n.max.multiplyScalar(t)}}let a=t.targets;if(void 0!==a){let e=new r.Pq0,t=new r.Pq0;for(let r=0,i=a.length;r<i;r++){let i=a[r];if(void 0!==i.POSITION){let r=s.json.accessors[i.POSITION],n=r.min,a=r.max;if(void 0!==n&&void 0!==a){if(t.setX(Math.max(Math.abs(n[0]),Math.abs(a[0]))),t.setY(Math.max(Math.abs(n[1]),Math.abs(a[1]))),t.setZ(Math.max(Math.abs(n[2]),Math.abs(a[2]))),r.normalized){let e=q(U[r.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}n.expandByVector(e)}e.boundingBox=n;let o=new r.iyt;n.getCenter(o.center),o.radius=n.min.distanceTo(n.max)/2,e.boundingSphere=o}(e,t,s),Promise.all(n).then(function(){return void 0!==t.targets?function(e,t,s){let r=!1,i=!1,n=!1;for(let e=0,s=t.length;e<s;e++){let s=t[e];if(void 0!==s.POSITION&&(r=!0),void 0!==s.NORMAL&&(i=!0),void 0!==s.COLOR_0&&(n=!0),r&&i&&n)break}if(!r&&!i&&!n)return Promise.resolve(e);let a=[],o=[],l=[];for(let u=0,h=t.length;u<h;u++){let h=t[u];if(r){let t=void 0!==h.POSITION?s.getDependency("accessor",h.POSITION):e.attributes.position;a.push(t)}if(i){let t=void 0!==h.NORMAL?s.getDependency("accessor",h.NORMAL):e.attributes.normal;o.push(t)}if(n){let t=void 0!==h.COLOR_0?s.getDependency("accessor",h.COLOR_0):e.attributes.color;l.push(t)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(t){let s=t[0],a=t[1],o=t[2];return r&&(e.morphAttributes.position=s),i&&(e.morphAttributes.normal=a),n&&(e.morphAttributes.color=o),e.morphTargetsRelative=!0,e})}(e,t.targets,s):e})}},7042:(e,t,s)=>{s.d(t,{F:()=>l,o:()=>i});var r=s(3720);class i{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}let n=new r.qUd(-1,1,1,-1,0,1);class a extends r.LoY{constructor(){super(),this.setAttribute("position",new r.qtW([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new r.qtW([0,2,0,0,2,0],2))}}let o=new a;class l{constructor(e){this._mesh=new r.eaF(o,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,n)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}},8388:(e,t,s)=>{s.d(t,{j:()=>l});var r=s(5729),i=s(3601);function n(){return"undefined"!=typeof window}function a(){return"production"}function o(){return"development"===((n()?window.vam:a())||"production")}function l(e){return(0,r.useEffect)(()=>{var t;e.beforeSend&&(null==(t=window.va)||t.call(window,"beforeSend",e.beforeSend))},[e.beforeSend]),(0,r.useEffect)(()=>{!function(e={debug:!0}){var t;if(!n())return;!function(e="auto"){if("auto"===e){window.vam=a();return}window.vam=e}(e.mode),window.va||(window.va=function(...e){(window.vaq=window.vaq||[]).push(e)}),e.beforeSend&&(null==(t=window.va)||t.call(window,"beforeSend",e.beforeSend));let s=e.scriptSrc?e.scriptSrc:o()?"https://va.vercel-scripts.com/v1/script.debug.js":e.basePath?`${e.basePath}/insights/script.js`:"/_vercel/insights/script.js";if(document.head.querySelector(`script[src*="${s}"]`))return;let r=document.createElement("script");r.src=s,r.defer=!0,r.dataset.sdkn="@vercel/analytics"+(e.framework?`/${e.framework}`:""),r.dataset.sdkv="1.5.0",e.disableAutoTrack&&(r.dataset.disableAutoTrack="1"),e.endpoint?r.dataset.endpoint=e.endpoint:e.basePath&&(r.dataset.endpoint=`${e.basePath}/insights`),e.dsn&&(r.dataset.dsn=e.dsn),r.onerror=()=>{let e=o()?"Please check if any ad blockers are enabled and try again.":"Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";console.log(`[Vercel Web Analytics] Failed to load script from ${s}. ${e}`)},o()&&!1===e.debug&&(r.dataset.debug="false"),document.head.appendChild(r)}({framework:e.framework||"react",basePath:e.basePath??function(){if(void 0!==i&&void 0!==i.env)return i.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH}(),...void 0!==e.route&&{disableAutoTrack:!0},...e})},[]),(0,r.useEffect)(()=>{e.route&&e.path&&function({route:e,path:t}){var s;null==(s=window.va)||s.call(window,"pageview",{route:e,path:t})}({route:e.route,path:e.path})},[e.route,e.path]),null}}}]);