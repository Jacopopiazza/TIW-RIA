package it.polimi.tiwria.Filter;


import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebFilter({"/CheckLogin"})
public class LoggedOutFilter implements Filter {


        /**
         * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
         */
        @Override
        public void init(FilterConfig filterConfig) {

        }

        /**
         * Checks if the user is logged out otherwise redirects to the home page.
         */
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpSession session = httpRequest.getSession();
            if (!session.isNew() && session.getAttribute("user") != null) {
                ((HttpServletResponse) response).sendRedirect(((HttpServletRequest) request).getContextPath() + "/home");
            } else {
                chain.doFilter(request, response);
            }
        }

        /**
         * @see Filter#destroy()
         */
        @Override
        public void destroy() {

        }

}
