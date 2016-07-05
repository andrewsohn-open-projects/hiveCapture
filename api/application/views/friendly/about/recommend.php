<!-- [D] contents -->
<div id="content" role="main" class="sg_infocnt">
	<div class="spot_area joy">
		<div class="inner">
			<?php navi_print_navi($rfcl, $rfmt); ?>
			<h2 class="h_tit h_joy">싱가포르 100배 즐기기</h2>
			<p class="h_txt">싱가포르에 가기 전에 알아두면 유용한 문화, 교통, 추천 정보<br>미리 알고 가면 즐거움이 배가 되요~<br>싱가포르에 대한 A부터 Z까지! 제대로 알고 제대로 즐기자!</p>
		</div>
	</div>
	<?php $this->load->view('friendly/about_tab', $tab_data); ?>
	<div class="inf_wrap">
		<h2 class="blind">싱가포르 추천 정보 소개</h2>
		<div class="inner">
			<h3 class="if_tit">꼭 가봐야 할 곳</h3>
			<ul class="spot_lst">
			<?php foreach($goList as $key=>$value){
			$img_url = '';
			if(isset($value->resp_img_nm)){
				$img_url = $data_url .$value->resp_img_path. $value->resp_img_nm;
				$ch = curl_init();
			    curl_setopt($ch, CURLOPT_URL, $img_url);
			    curl_setopt($ch, CURLOPT_NOBODY, 1);
			    curl_setopt($ch, CURLOPT_FAILONERROR, 1);
			    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			    if(curl_exec($ch)===FALSE) $img_url = '';
			}
			?>
			<li>
				<div class="spot_box">
					<a href="<?= site_url('friendly/spot/'.$value->spot_no) ?>"><?php if(isset($img_url) && $img_url){?>
						<img src="<?= $img_url ?>" width="230" height="230" alt="" class="s_img"><?php }?>
						<div class="s_cont">
							<strong class="tit"><?= $value->spot_nm ?></strong> <!--[D] 2줄 말줄임 -->
							<p class="txt"><?= $value->desc_title ?></p> <!--[D] 4줄 말줄임 -->
						</div>
					</a>
				</div>
			</li>
			<?php }?>
			</ul>
			<h3 class="if_tit">꼭 해봐야 할 것</h3>
			<ul class="simp_lst type2">
			<?php foreach($doList as $key=>$value){ 
				$img_url = '';
				if(isset($value->resp_img_nm)){
					$img_url = $data_url .$value->resp_img_path. $value->resp_img_nm;
					$ch = curl_init();
				    curl_setopt($ch, CURLOPT_URL, $img_url);
				    curl_setopt($ch, CURLOPT_NOBODY, 1);
				    curl_setopt($ch, CURLOPT_FAILONERROR, 1);
				    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
				    if(curl_exec($ch)===FALSE) $img_url = '';
				}
			?>
			<li>
				<a href="<?= site_url('friendly/spot/'.$value->spot_no) ?>" class="simp_bx">
					<span class="img_wrap"><?php if(isset($img_url) && $img_url){?><img src="<?= $img_url ?>" width="172" height="172" alt="" class="s_img"><?php }?></span>
					<div class="s_cont">
						<strong class="tit"><?= $value->spot_nm ?></strong>
					</div>
				</a>
			</li>
			<?php }?>
			</ul>
			<h3 class="if_tit">꼭 먹어봐야 할 것</h3>
			<ul class="simp_lst">
			<li>
				<a href="<?= site_url('friendly/spot/324'); ?>" class="simp_bx">
					<span class="img_wrap"><img src="<?= $ast_url; ?>/img/img_eat01.jpg" width="172" height="172" alt="" class="s_img"></span>
					<div class="s_cont">
						<strong class="tit">바쿠테</strong>
					</div>
				</a>
			</li>
			<li>
				<a href="<?= site_url('friendly/spot/225'); ?>" class="simp_bx">
					<span class="img_wrap"><img src="<?= $ast_url; ?>/img/img_eat02.jpg" width="172" height="172" alt="" class="s_img"></span>
					<div class="s_cont">
						<strong class="tit">프론 미</strong>
					</div>
				</a>
			</li>
			<li>
				<a href="<?= site_url('friendly/spot').'?cate=3' ?>" class="simp_bx">
					<span class="img_wrap"><img src="<?= $ast_url; ?>/img/img_eat03.jpg" width="172" height="172" alt="" class="s_img"></span>
					<div class="s_cont">
						<strong class="tit">칠리 크랩</strong>
					</div>
				</a>
			</li>
			<li>
				<a href="<?= site_url('friendly/spot/351'); ?>" class="simp_bx">
					<span class="img_wrap"><img src="<?= $ast_url; ?>/img/img_eat04.jpg" width="172" height="172" alt="" class="s_img"></span>
					<div class="s_cont">
						<strong class="tit">카야 토스트</strong>
					</div>
				</a>
			</li>
			<li>
				<a href="<?= site_url('friendly/spot/236'); ?>" class="simp_bx">
					<span class="img_wrap"><img src="<?= $ast_url; ?>/img/img_eat05.jpg" width="172" height="172" alt="" class="s_img"></span>
					<div class="s_cont">
						<strong class="tit">사테</strong>
					</div>
				</a>
			</li>
			</ul>
		</div>
	</div>
</div>
<!-- //[D] contents -->