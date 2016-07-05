
		<!-- [D] contents -->
		<div id="content" role="main">
			<div class="spot_area">
				<h3 class="spot_tit">SEARCH</h3>
				<span class="img_wrap"><img src="<?= $ast_url; ?>/img/spot_search.jpg" alt=""></span>
			</div>
			
			<div class="search_wrap none">
				<p class="none_txt">"검색 결과가 없습니다. 다른 검색어로 시도해보세요."</p>

				<div class="art_lst">
					<div class="lst_top">
						<h3 class="tit">추천키워드</h3>
					</div>
					<div class="side_key">
					<ul class="key_lst">
					<?php 
						foreach ($keyWordlist as $value) {
							# code...
					?>
					<li><a href="<?= site_url('search'); ?>?keyWord=<?= $value->val ;?>"><?= $value->val ;?></a></li>
					
					<!-- <li class="selected"><a href="#">라이센싱</a></li> -->
					<?php
						}
					?>
					</ul>
					</div>
				</div>
			</div>
		</div>
		<!-- //[D] contents -->
	