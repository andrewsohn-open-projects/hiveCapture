<?php if (!defined('BASEPATH')) exit('No direct script access allowed.');

class HI_Zip extends CI_Zip {   
    /**
     * Read a directory and add it to the zip using the new filepath set.
     *
     * This function recursively reads a folder and everything it contains (including
     * sub-folders) and creates a zip based on it.  You must specify the new directory structure.
     * The original structure is thrown out.
     *
     * @access  public
     * @param   string  path to source
     * @param   string  new directory structure
     */
    function get_files_from_folder($directory, $put_into, $recursion = false) 
    {
        if ($handle = opendir($directory)) 
        {
            while (false !== ($file = readdir($handle))) 
            {
                if (is_file($directory.$file)) 
                {
                    $fileContents = file_get_contents($directory.$file);

                    $this->add_data($put_into.$file, $fileContents);

                } 

                elseif ($recursion and $file != '.' and $file != '..' and is_dir($directory.$file)) {

                    $this->add_dir($put_into.$file.'/');

                    $this->get_files_from_folder($directory.$file.'/', $put_into.$file.'/', $recursion);
                }

            }//end while

        }//end if

        closedir($handle);
    }
}