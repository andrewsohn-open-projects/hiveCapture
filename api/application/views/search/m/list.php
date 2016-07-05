
		<!-- [D] contents -->
		<div id="content" role="main">
			<div class="spot_area">
				<h3 class="spot_tit">SEARCH</h3>
				<span class="img_wrap"><img src="<?= $ast_url ?>/img/spot_search.jpg" alt=""></span>
			</div>
			
			<div class="search_wrap">
				<?php 
					if(count($sevlist)){
				?>
				<div class="art_lst">

					<div class="lst_top">
						<h3 class="tit">SERVICES</h3>
						<a href="<?= site_url('service'); ?>" class="lst_more">MORE</a>
					</div>
					<div class="side_key">
					<ul class="key_lst">
					<?php
						foreach ($sevlist as $value) {
							# code...
					?>									
					<li><a href="<?= site_url('service/content').'/'.$value->sev_no; ?>?keyWord=<?= $keyWord;?>"><?=  str_replace($keyWord , '<em class="red_color">'. $keyWord .'</em>' , $value->sev_nm )  ?></a></li>
					<?php
						}
					?>	
					</ul>
					</div>

					
				</div>
				<?php
					}
				?>	

					
				<?php
					if(count($partlist)){
				?>								
				<div class="art_lst">

					<div class="lst_top">
						<h3 class="tit">PARTS</h3>
						<a href="<?= site_url('service/content/1#a'); ?>" class="lst_more">MORE</a>
					</div>
					<div class="side_key">
					<ul class="key_lst">
					<?php
						foreach ($partlist as $value) {
							# code...
					?>
						<li><a href="<?= site_url('service/part').'/'.$value->part_no; ?>?keyWord=<?= $keyWord;?>"><?=  str_replace($keyWord , '<em class="red_color">'. $keyWord .'</em>' , $value->part_nm )  ?></a></li>
					<?php
						}
					?>	
					</ul>
									
					</div>


				</div>

				<?php 
					}
				?>	

	
				<?php 
					if(count($prolist)){
						$i = 0;
				?>
				<div class="art_lst">

					<div class="lst_top">
						<h3 class="tit">PROFESSIONALS</h3>
						<a href="<?= site_url('professionals') ;?>" class="lst_more">MORE</a>
					</div>
					<!-- [D] 8명만 노출 -->
					<ul class="pro_lst">
					<?php
						foreach ($prolist as $value) {
							if($i < 8) {
								$img_url = $ast_url.'/img/per_default.jpg';
								if(isset($value->thumb_img_nm) && $value->thumb_img_nm != '') $img_url = config_item('upload_url').$value->thumb_img_path. '/' . $value->thumb_img_nm;
					?>	
					<li>
						<a href="<?= site_url('professionals').'/'.$value->pro_no ;?>?keyWord=<?= $keyWord;?>">
							<img src="<?= $img_url ?>" width="153" height="147" alt="<?= $value->pro_nm ?>" onError="this.onerror=null;this.src='<?= $ast_url; ?>/img/per_default.jpg';"><!-- [D] 대체텍스트 어드민 등록 노출 -->
							<strong><?= $value->pro_nm ?></strong>
						</a>
					</li>
					<?php
							} else {

								break;
							}
						$i++;
						}
					?>					
					</ul>

				</div>
				<?php 
					}
				?>


				<?php 
					if(count($artilist)){
						$i = 0;
				?>				

				<div class="art_lst srch_arts">
				
					<div class="lst_top">
						<h3 class="tit">ARTICLES</h3>
						<a href="<?= site_url('articles')?>?keyWord=<?= $keyWord;?>" class="lst_more">MORE</a>
					</div>
					<ul class="art_con">
					<?php
						foreach ($artilist as $value) {
					?>	
					<li>
						<a href="<?= site_url('articles/view').'/'.$value->arti_no ;?>?keyWord=<?= $keyWord;?>">
							<strong><?=  str_replace($keyWord , '<em class="red_color">'. $keyWord .'</em>' , $value->subject )  ?></strong>
							<span class="dat"><?= $value->year; ?>.<?= $value->mmdd; ?></span>
						</a>
					</li>
					<?php 
						}
					?>						
					</ul>
				
				</div>

				<?php 
					}
				?>					
			</div>
		</div>
		<!-- //[D] contents -->
	